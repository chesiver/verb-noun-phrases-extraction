const { DefaultDict } = require('./DefaultDict');

class AveragedPerceptron {

    constructor() {
        /**
         * Each feature gets its own weight vector, so weights is a dict-of-dicts
         */
        this.weights = {};
        this.classes = new Set();
        /**
         * The accumulated values, for the averaging. These will be keyed by
         * Feature/Class tuples
         */
        this._totals = new DefaultDict(Number);
        /**
         * The last time when the feature was changed, for the averaging. Also keyed by
         * Feature/Class tuples
         */
        this._tstamps = new DefaultDict(Number);
        /**
         * Number of training instances seen
         */
        this.i = 0;
    }

    predict(features) {
        const scores = new DefaultDict(Number);
        for (const [feat, value] of Object.entries(features)) {
            if (!this.weights[feat] || value === 0) {
                continue;
            }
            const weights = this.weights[feat];
            for (const [cls, w] of Object.entries(weights)) {
                scores[cls] += value * w;
            }
        }
        /**
         * Select Class with highest score
         */
        let res = null;
        for (const cls of this.classes) {
            if (res === null) { res = cls; continue; }
            if (scores[cls] > scores[res] || scores[cls] === scores[res] && cls > res) {
                res = cls;
            }
        }
        return res;
    }

    update(truth, guess, features, value = 1.0) {
        const update_feat = (c, f, w, v) => {
            const key = f + ' ' + c;
            this._totals[key] += (this.i - this._tstamps[key]) * w;
            this._tstamps[key] = this.i;
            this.weights[f][c] = w + v;
        }
        this.i += 1;
        if (truth === guess) return;
        for (const f of Object.keys(features)) {
            const weights = this.weights[f] || {};
            this.weights[f] = weights;
            update_feat(truth, f, weights[truth] || 0, value);
            update_feat(guess, f, weights[guess] || 0, -value);
        }
    }

    average_weights() {
        for (const [feat, weights] of Object.entries(this.weights)) {
            const new_feat_weights = {};
            for (const [cls, weight] of Object.entries(weights)) {
                const key = feat + ' ' + cls;
                let total = this._totals[key];
                total += (this.i - this._tstamps[key]) * weight;
                const averaged = (total / this.i).toFixed(3);
                if (averaged) {
                    new_feat_weights[cls] = averaged;
                }
            }
            this.weights[feat] = new_feat_weights;
        }
    }

}


function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function train(nr_iter, examples) {
    const model = AveragedPerceptron();
    for (let i = 0; i < nr_iter; i += 1) {
        shuffle(examples);
        for (const [features, true_cls] of examples) {
            const scores = model.predict(features);
            let max_label = null, max_score = 0;
            for (const [label, score] of Object.entries(scores)) {
                if (max_label === null || score > max_score) {
                    max_label = label;
                    max_score = score;
                }
            }
            if (max_cls != true_cls) {
                model.update(true_cls, max_cls, features);
            }
        }
    }
    model.average_weights();
    return model;
}

module.exports = { AveragedPerceptron, train };