const assert = require('assert');
const KeywordExtractor = require('../KeywordExtractor')

describe('Extraction Results Verification: ', () => {
    it('1', () => {
        const sentence = 'create a task to make a proposal at 1pm tomorrow';
        assert.deepStrictEqual(KeywordExtractor.extractSubject(sentence), [
            'create a task',
            'make a proposal'
        ]);
    });
    it('2', () => {
        const sentence = 'get tasks with the subject organize a meeting with pinnacle';
        assert.deepStrictEqual(KeywordExtractor.extractSubject(sentence), [
            'get tasks with the subject',
            'organize a meeting with pinnacle'
        ]);
    });
    it('3', () => {
        const sentence = 'get task where the subject is send john his forms'
        assert.deepStrictEqual(KeywordExtractor.extractSubject(sentence), [
            'get task',
            'send john his forms'
        ]);
    });
});
