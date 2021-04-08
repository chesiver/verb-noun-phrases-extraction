const assert = require('assert');
const KeywordExtractor = require('../src/KeywordExtractor')
const testData = require('./test-pairs.json')

describe('Extraction Results Verification: \n', () => {
    testData.forEach(({sentence, expected}, i) => {
        it(`Example: ${sentence}\n`, () => {
            assert.deepStrictEqual(KeywordExtractor.extractSubject(sentence), expected);
        });
    })
});
