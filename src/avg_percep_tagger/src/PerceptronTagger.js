const { DefaultDict } = require('./DefaultDict');
const { AveragedPerceptron, shuffle }  = require('./AveragedPerceptron');

const START = ['-START-', '-START2-'];
const END = ['-END-', '-END2-'];

class PerceptronTagger {
    
    constructor(avgModel) {
        this.model = new AveragedPerceptron();
        this.freq_counts = null;
        /**
         * Load
         */
        const [weights, tagdict, classes] = avgModel;
        this.model.weights = weights;
        this.tagdict = tagdict;
        this.model.classes = this.classes = new Set(classes);
    }

    _make_tagdict(sentences) {
        const counts = new DefaultDict(() => new DefaultDict(Number));
        for (const [words, tags] of sentences) {
            for (const [i, word] of words.entries()) {
                const tag = tags[i];
                counts[word][tag] += 1;
                this.classes.add(tag);
            }
        }
        const freq_thresh = 20;
        const ambiguity_thresh = 0.97;
        for (const [word, tag_freqs] of Object.entries(counts)) {
            let max_tag = null, max_cnt = 0, sum_cnt = 0;
            for (const [tag, cnt] of Object.entries(tag_freqs)) {
                if (max_tag === null || cnt > max_cnt) {
                    max_tag = tag;
                    max_cnt = cnt;
                }
                sum_cnt += cnt;
            }
            if (sum_cnt >= freq_thresh && max_cnt / sum_cnt >= ambiguity_thresh) {
                this.tagdict[word] = max_tag;
            }
        }
    }
    
    _normalize(word) {
        if (!word) {
            return '!EMPTY';
        } else if (word.indexOf('-') >= 0 && word[0] != '-') {
            return '!HYPHEN';
        } else if (word.match(/^\d+$/) && word.length === 4) {
            return '!YEAR';
        } else if (word[0].match(/^\d+$/)) {
            return '!DIGITS';
        } else {
            return word.toLowerCase();
        }
    }

    _get_features(i, word, context, prev, prev2) {
        i += START.length;
        const features = new DefaultDict(Number);
        const add = (...args) => {
            const key = args.join(' ');
            features[key] += 1;
        };
        add('bias');
        add('i suffix', word.slice(-3));
        add('i pref1', word[0]);
        add('i-1 tag', prev);
        add('i-2 tag', prev2);
        add('i tag+i-2 tag', prev, prev2);
        add('i word', context[i]);
        add('i-1 tag+i word', prev, context[i]);
        add('i-1 word', context[i - 1]);
        add('i-1 suffix', context[i - 1].slice(-3));
        add('i-2 word', context[i - 2]);
        add('i+1 word', context[i + 1]);
        add('i+1 suffix', context[i + 1].slice(-3));
        add('i+2 word', context[i + 2]);
        return features;
    }
    
    train(sentences, nr_iter = 5) {
        this._make_tagdict(sentences);
        this.model.classes = this.classes;
        for (let iter_cnt = 0; iter_cnt < nr_iter; iter_cnt += 1) {
            let c = 0, n = 0;
            for (const [words, tags] of sentences) {
                let [prev, prev2] = START;
                const context = [].concat(START, words.map(word => this._normalize(word)), END);
                for (const [i, word] of words.entries()) {
                    let guess = this.tagdict[word];
                    if (!guess) {
                        const feats = this._get_features(i, word, context, prev, prev2);
                        guess = this.model.predict(feats);
                        this.model.update(tags[i], guess, feats);
                    }
                    prev2 = prev; 
                    prev = guess;
                    c += guess === tags[i] ? 1 : 0;
                    n += 1;
                }
            }
            shuffle(sentences);
            console.log(`Iter ${iter_cnt}: ${c}/${n}=${c / n}`);
        }
        this.model.average_weights();
    }
    
    tag(words) {
        let [prev, prev2] = START;
        const context = [].concat(START, words.map(word => this._normalize(word)), END);
        const tokens = [];
        for (const [i, word] of words.entries()) {
            let tag = this.tagdict[word];
            if (!tag) {
                const features = this._get_features(i, word, context, prev, prev2);
                tag = this.model.predict(features);
            }
            tokens.push([word, tag]);
            prev2 = prev;
            prev = tag;
        }
        return tokens;
    }

    test(test_samples) {
        let c = 0, n = 0;
        for (const sentence of test_samples) {
            const [words, tags] = sentence;
            const res = new Map(this.tag(words));
            for (const [i, word] of words.entries()) {
                if (!word) continue;
                if (res.get(word) === tags[i]) c += 1;
                n += 1;
            }
        }
        console.log(`Test Result : ${c}/${n}=${c / n}`);
    }

}

module.exports = { PerceptronTagger };
