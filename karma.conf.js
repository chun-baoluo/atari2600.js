const webpackConfig = require("./webpack.config");

module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['mocha', 'chai'],

        files: [
            'test/**/*.spec.ts'
        ],

        exclude: [
        ],

        preprocessors: {
            "test/**/*.spec.ts": ["webpack"]
        },

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        singleRun: false,

        concurrency: Infinity,

        mime: {
            'text/x-typescript': ['ts']
        },

        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve
        }
    });
}
