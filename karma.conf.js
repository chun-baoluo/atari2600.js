module.exports = (config) => {
    config.set({
        frameworks: ['mocha', 'chai'],

        files: [
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
                loaders: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader',
                        exclude: /dev-old/
                    }
                ]
            },
            resolve: {
                extensions: ['*', '.ts']
            }
        }
    });
}
