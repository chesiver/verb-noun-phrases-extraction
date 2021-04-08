const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/KeywordExtractor.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'verb-noun-extraction.bundle.js',
    },
};

