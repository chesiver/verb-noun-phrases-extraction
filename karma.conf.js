const webpackConfig = require('./webpack.config');

module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'webpack'],
        reporters: ['mocha'],
        plugins: [
            'karma-webpack',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-chrome-launcher',
        ],
        files: [
            { pattern: 'test/*.js', watched: false }
        ],
        preprocessors: {
            'test/*.js': ['webpack']
        },
        webpack: {
            resolve: webpackConfig.resolve,
            plugins: webpackConfig.plugins,
            mode: 'development',
        },
        browsers: ['ChromeHeadless'],
        // customLaunchers: {
        //     Chrome_without_security: {
        //         base: 'Chrome',
        //         flags: ['--disable-web-security', '--disable-site-isolation-trials']
        //     }
        // },
        singleRun: true,
    });
};
