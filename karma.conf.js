module.exports = (config) => {
    config.set({
        frameworks: ['mocha', 'chai'],

        files: [
            'node_modules/babel-polyfill/dist/polyfill.min.js',
            'test/**/*.spec.ts'
        ],

        preprocessors: {
            "test/**/*.spec.ts": ["webpack"]
        },

        browsers: ['PhantomJS'],

        mime: {
            'text/x-typescript': ['ts']
        },

        webpack: {
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader'
                    }
                ]
            },
            resolve: {
                extensions: ['*', '.ts']
            },
            mode: 'development'
        }
    });
}
