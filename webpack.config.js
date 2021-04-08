const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/KeywordExtractor.js',
    module: {
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'verb-noun-extraction.bundle.js',
        library: 'verbExtraction',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        fallback: {
            fs: false,
            os: false,
            'webworker-threads': false,
        }
    }
};

