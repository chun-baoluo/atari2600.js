module.exports = (config) => {
    config.set({
        frameworks: ['mocha', 'chai'],

        files: [
            'test/**/*.spec.ts'
        ],

        preprocessors: {
            "test/**/*.spec.ts": ["webpack"]
        },

        browsers: ['Chrome'],

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
