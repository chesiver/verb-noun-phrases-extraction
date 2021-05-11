const assert = require('assert');
const fetch = require("node-fetch");
const KeywordExtractor = require('../src/KeywordExtractor')
const testData = require('./test-pairs.json')

describe('Extraction Results Verification: \n', () => {

    before(async () => {
        await Promise.all([
            fetch('https://raw.githubusercontent.com/chesiver/verb-noun-phrases-extraction/main/src/brill_pos_tagger/data/English/lexicon_from_posjs.json'),
            fetch('https://raw.githubusercontent.com/chesiver/verb-noun-phrases-extraction/main/src/avg_percep_tagger/model/weights.json'),
        ]).then(async ([res1, res2]) => {
            const lexicon = await res1.json(), avg_model = await res2.json();
            await KeywordExtractor.init(lexicon, avg_model);
        })
    });

    testData.forEach(({sentence, expected}, i) => {
        it(`Example: ${sentence}\n`, () => {
            assert.deepStrictEqual(KeywordExtractor.extractSubject(sentence), expected);
        });
    })
});
