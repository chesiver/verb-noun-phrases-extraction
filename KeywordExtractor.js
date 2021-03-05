const natural = require('natural');
const chunker = require('pos-chunker');
class KeywordExtractor {

    static tokenizeSentence(sentences) {
        const tokenizer = new natural.SentenceTokenizer();
        return tokenizer.tokenize(sentences);
    }

    static tokenizeWord(sentence) {
        const tokenizer = new natural.WordTokenizer();
        return tokenizer.tokenize(sentence);
    }

    static tagSentence(sentence) {
        const language = "EN"
        const defaultCategory = 'NN';
        const defaultCategoryCapitalized = 'NNP';
        const lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
        const ruleSetCurrent = new natural.RuleSet('CURRENT');
        const ruleSetCondition = new natural.RuleSet('EN');
        const tagger = new natural.BrillPOSTagger(lexicon, ruleSetCurrent, ruleSetCondition);
        const tokenizedSentence = this.tokenizeWord(sentence);
        const taggedWords = tagger.tag(tokenizedSentence);
        return taggedWords;
    }

    static formatSentence(sentence) {
        const taggedWords = this.tagSentence(sentence);
        let formattedSentence = '';
        for (const [_, tagged] of Object.entries(taggedWords)) {
            for (let i = 0; i < tagged.length; i++) {
                formattedSentence += tagged[i].token + '/' + tagged[i].tag.replace(/\$/g, '') + ' '
            }
        }
        return formattedSentence.trim();
    }

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
    static extractSubject(sentence) {
        // sentence = sentence.trim().toLowerCase();
        let formattedSentence = this.formatSentence(sentence)
        console.log(formattedSentence)
        const NP = {
            ruleType: 'tokens',
            // pattern: '[ { tag:/DT|JJ|VBG|PRP|NN.*?/ } ]+',
            pattern: '[ {tag:/DT/} ]? [ {tag:/JJ/} ]* [ {tag:/PRP/} ]* [ {tag:/VBG|NNP|NNS|NN.*?/} ]+',
            // pattern: '[ {tag:/DT/} ]? [ {tag:/JJ/} ]* [ {tag:/IN/} ]* [ {tag:/PRP/} ]* [ {tag:/VBG|NNP|NNS|NN.*?/} ]+',
            result: 'NP'
        };

        const PP = {
            ruleType: 'tokens',
            pattern: '[ { tag:IN|TO } ] [ { chunk:NP } ]+',
            result: 'PP'
        };

        const PPN = {
            ruleType: 'tokens',
            // pattern: '(?:(?= [ { chunk:/PP/ } ] )[ { chunk:/PP/ } ]|(?![ { chunk:/PP/ } ])[ { chunk:/PP/ } ])',
            // pattern: ' [ {chunk:/PP/} ] [ {chunk:/NP/} ] [ {chunk:/PP/} ]? | [ {chunk:/NP/} ]+',
            // pattern: ' ([ {chunk:/PP/} ]) ([ {chunk:/PP/} ]).*? ',
            pattern: '[ { chunk:/PP/ } ] ((?!=[ { chunk:/PP/ } ])|(?![ { chunk:/PP/ } ]))',
            // (?:\D*(\d+)){2}

            result: 'PPN'
        }

        // [ { chunk:/NP/} ]
        // [ { chunk:/PPN/} ]

        const VP = {
            ruleType: 'tokens',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/NP|PPN/ } ]+',
            pattern: ' [ { tag:/VB.?/ } ] ([ { chunk:/PPN/} ][ { chunk:/NP/} ])* [ { chunk:/NP/} ]* [ { chunk:/NP|PPN/ } ]',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PPN/} ]? [ { chunk:/NP/} ]+ [ { chunk:/PPN/} ]?',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PP/ } ]' ,
            // [ { word:have } ] (?=[ { word:/dinner|lunch/ } ])
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PP/ } ] (?!=[ { chunk:/PP/ } ]) [ { chunk:/NP/ } ]+ [ { chunk:/PP/ } ]? (?=[ { chunk:/PP/ } ])',
            // pattern: '[ {chunk:/PP/} ] | [ {chunk:/PP/} ] (?![{ chunk:/PP/ } ])',
            // pattern: '[ { tag:/VB.?/ } ] [ { chunk:/PP/ } ] [ { chunk:/NP/ } ]  +', 
            result: 'VP'
        };

        // grammar = "NP: {<VB.*>?<RB>?<DT>?<PRP.*>?<NN.*>?<IN>?<DT>?<JJ.*>*<NN.*>*<IN.*>?<NN.*>?}"

        const rules = [NP, PP, PPN, VP]

        let chunked = chunker.chunk(formattedSentence, rules);
        let longest = 0;
        let longestIndex = -1;
        console.log(chunked)
        let trees = this.getPossibleSubjects(chunked);
        trees = this.removeTags(trees);
        return trees;
    }
}
module.exports = KeywordExtractor;
