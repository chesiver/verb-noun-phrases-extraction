const chunker = require('./pos-chunker/index');
const abbreviation = require('./abbreviation.json');
const tokenization = require('./tokenizers/index');
const { PerceptronTagger } = require('./avg_percep_tagger/src/PerceptronTagger');

/**
 * Replace to use our modified brill pos tagger lib files
 */
const BrillPOSTagger = require('./brill_pos_tagger/lib/Brill_POS_Tagger');
const Lexicon = require('./brill_pos_tagger/lib/Lexicon');
const RuleSet = require('./brill_pos_tagger/lib/RuleSet');

let avg_tagger, brill_tagger, lexicon;
class KeywordExtractor {

    static tokenizeSentence(sentences) {
        const tokenizer = new tokenization.SentenceTokenizer();
        return tokenizer.tokenize(sentences);
    }

    static tokenizeWord(sentence) {
        const tokenizer = new tokenization.RegexpTokenizer({
            pattern: /([A-zÀ-ÿ-0-9_:-]+|.|!|\?|'|"|;|,)/i
        });
        return tokenizer.tokenize(sentence);
    }

    static tagSentence(sentence, info = false) {
        const tokenizedSentence = this.tokenizeWord(sentence);
        // console.log('tokenizedSentence', tokenizedSentence);
        const taggedWords = brill_tagger.tag(tokenizedSentence);
        // console.log('taggedWords', taggedWords);
        /**
         * Look up avg perceptron tagger.
         * This aims to provide a more accurate tag for words not in lexicon file instead of 
         * assigning default category to them.
         */
        const avg_taggedWords = new Map(avg_tagger.tag(tokenizedSentence));
        for (const item of taggedWords.taggedWords) {
            if (
                !lexicon.isExist(item.token) 
                && !lexicon.isExist(item.token.toLowerCase())
                && item.tag != 'CD'
                && item.tag !== avg_taggedWords.get(item.token)
            ) {
                if (info) console.log('Replacement: ', item.token, item.tag, avg_taggedWords.get(item.token))
                item.tag = avg_taggedWords.get(item.token);
            }
        }
        return taggedWords;
    }

    /**
     * 
     * @param {*} sentence plain string
     * output a formatted tagged sentence recogizable for chunker
     */
    static formatSentence(sentence) {
        for (const [s1, s2] of Object.entries(abbreviation)) {
            sentence = sentence.replace(new RegExp(s1, 'g'), s2);
        }
        const taggedWords = this.tagSentence(sentence);
        let formattedSentence = '';
        for (const [_, tagged] of Object.entries(taggedWords)) {
            for (let i = 0; i < tagged.length; i++) {
                formattedSentence += tagged[i].token + '/'
                    + tagged[i].tag
                        // chunk lib has some bug so here we don't use PRP$, instead rename it to be PRS
                        .replace(/PRP\$/g, 'PRS') 
                    + ' ';
            }
        }
        return formattedSentence.trim();
    }

    /**
     * Split chunked results (just a string). Extract a list of "[VP ... ]"
     */
    static getPossibleSubjects(chunked) {
        let vpStart = chunked.indexOf('[VP');
        if (vpStart === -1) {
            return [];
        }
        let numParenthesis = 0;
        let possibleSubjects = []
        for (let i = vpStart; i < chunked.length; i++) {
            if (chunked[i] === '[') {
                numParenthesis++;
            } else if (chunked[i] === ']') {
                numParenthesis--;
            }
            if (numParenthesis === 0) {
                const vp = chunked.substring(vpStart, i+1);
                possibleSubjects.push(vp.trim());
                vpStart = chunked.substring(i).indexOf('[VP');
                if (vpStart === -1) {
                    break;
                }
                vpStart = vpStart + i - 1
                i = vpStart;
                numParenthesis = 0;
                // numClosing = 0
            }
        }
        return possibleSubjects;
    }

    static formatSubject(subject) {
        subject = subject.replace(/[\[|\]|\/]/g, '').replace(/[A-Z]/g, '').replace(/ {2,}/g, ' ').trim();
        return subject;
    }

    /**
     * remove square brackets && tags of splitted chuck
     */
    static removeTags(trees) {
        for (let i = 0; i < trees.length; i++) {
            trees[i] = trees[i].replace(/\[[^ ]* /g, '') // remove left hand chunk eg. [VP
                               .replace(/\/[^ ]* /g, ' ') // remove tag with space following backlash eg. /NN
                               .replace(/\/[A-Z]*/g, '') // remove tags with no space following backlash 
                               .replace(/\]/g, ''); // remove right closing bracket ]
        }
        return trees;
    }

    /**
     * TODO: Distinguish date time grammar from <company name that is tagged as uncommon noun>.
     *       natural library's POS tagger tags uncommon nouns and date time related words as 'N'
     *       so there's no way to distinguish <company name that is tagged as uncommon noun>
     *       from date time. 
     *       eg. 'set reminder to send message to [company name that is an uncommon noun]'
     *            and ‘set reminder to send message at 2pm’ will incorrectly return 
     *            'send message to [company name that is an uncommon noun]' and 
     *            'send message at 2pm' respectively. 
     *            Expected return should be 'send message to [company name that is an uncommon noun]'
     *            and 'send message' respectively. 
     * @param {} sentence 
     */
    static extractSubject(sentence, info = false) {
        // sentence = sentence.trim().toLowerCase();
        if (info) console.log(sentence)
        let formattedSentence = this.formatSentence(sentence)
        if (info) console.log(formattedSentence)
        const N = {
            ruleType: 'tokens',
            pattern: '[ {tag:/VBG|NNP|CD|NNS|NN.*?/} ]',
            result: 'N'
        };
        const NCN = {
            ruleType: 'tokens',
            pattern: '[{ chunk:/N/ }] [{tag:/CC/}] [ { chunk:/N/ } ]',
            result: 'NCN'
        }
        const NP = {
            ruleType: 'tokens',
            // pattern: '[ { tag:/DT|JJ|VBG|PRP|NN.*?/ } ]+',
            pattern: String.raw`[ {tag:/DT/} ]? [ {tag:/JJ/} ]* [ {tag:/PRS/} ]? ([{ chunk:/N|NCN/ }] | [{ tag: /PRP/}])`,
            // pattern: '[ {tag:/DT/} ]? [ {tag:/JJ/} ]* [ {tag:/IN/} ]* [ {tag:/PRP/} ]* [ {tag:/VBG|NNP|NNS|NN.*?/} ]+',
            result: 'NP'
        };

        const PP = {
            ruleType: 'tokens',
            pattern: String.raw`[ { tag:IN|TO; word:/\b(?!that\b)\w+/ } ]`,
            result: 'PP'
        };

        const PPN = {
            ruleType: 'tokens',
            // pattern: '(?:(?= [ { chunk:/PP/ } ] )[ { chunk:/PP/ } ]|(?![ { chunk:/PP/ } ])[ { chunk:/PP/ } ])',
            // pattern: ' [ {chunk:/PP/} ] [ {chunk:/NP/} ] [ {chunk:/PP/} ]? | [ {chunk:/NP/} ]+',
            // pattern: ' ([ {chunk:/PP/} ]) ([ {chunk:/PP/} ]).*? ',
            pattern: '[ { chunk:/PP/ } ] [ { chunk:NP } ]+',
            // (?:\D*(\d+)){2}

            result: 'PPN'
        }

        // [ { chunk:/NP/} ]
        // [ { chunk:/PPN/} ]
        const V = {
            ruleType: 'tokens',
            pattern: String.raw`[ { tag:/VB([^G]|\b)/; word:/\b(?!(am|is|are|was|were|be|Am|Is|Was|Were|Be)\b)\w+/ } ]`,
            result: 'V'
        }

        const VP = {
            ruleType: 'tokens',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/NP|PPN/ } ]+',
            // pattern: ' [ { tag:/VB.?/ } ] ([ { chunk:/PPN/} ][ { chunk:/NP/} ])* [ { chunk:/NP/} ]* [ { chunk:/NP|PPN/ } ]',
            pattern: String.raw`[ { chunk:/V/ } ]
            [ {tag:/PRS/} ]? [ { chunk:/NP|PPN/ } ]+
            [ {tag:/RB*/} ]*`,
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PPN/} ]? [ { chunk:/NP/} ]+ [ { chunk:/PPN/} ]?',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PP/ } ]' ,
            // [ { word:have } ] (?=[ { word:/dinner|lunch/ } ])
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PP/ } ] (?!=[ { chunk:/PP/ } ]) [ { chunk:/NP/ } ]+ [ { chunk:/PP/ } ]? (?=[ { chunk:/PP/ } ])',
            // pattern: '[ {chunk:/PP/} ] | [ {chunk:/PP/} ] (?![{ chunk:/PP/ } ])',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PP/ } ] [ { chunk:/NP/ } ]  +', 
            result: 'VP'
        };

        // const DEF = {
        //     ruleType: 'tokens',
        //     pattern: '[ { chunk:NP } ] [ { word:/be/am/are/is/was/were/} ] [ { chunk:NP } ]',
        //     result: 'DEF'
        // }

        // grammar = "NP: {<VB.*>?<RB>?<DT>?<PRP.*>?<NN.*>?<IN>?<DT>?<JJ.*>*<NN.*>*<IN.*>?<NN.*>?}"

        const rules = [V, N, NCN, NP, PP, PPN, VP]

        let chunked = chunker.chunk(formattedSentence, rules);
        if (info) console.log(chunked)
        let trees = this.getPossibleSubjects(chunked);
        trees = this.removeTags(trees);
        return trees;
    }
}

function extractSubject(str) {
    if (!avg_tagger || !brill_tagger) return null;
    return KeywordExtractor.extractSubject(str);
}

async function init(lexiconJson, avgModel) {
    const defaultCategory = 'NN';
    const defaultCategoryCapitalized = 'NNP';
    lexicon = new Lexicon(lexiconJson, defaultCategory, defaultCategoryCapitalized);
    const ruleSetCondition = new RuleSet('CURRENT');
    const ruleSetDefault = new RuleSet('EN');
    brill_tagger = new BrillPOSTagger(lexicon, ruleSetDefault, ruleSetCondition);
    avg_tagger = new PerceptronTagger(avgModel);
}

module.exports = {
    extractSubject,
    init,
};
