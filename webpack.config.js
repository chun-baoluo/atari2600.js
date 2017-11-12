const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

var config = {
    entry: {
        app: './dev/index.ts'
    },

    resolve: {
        extensions: ['', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts'
            }
        ]
    },

    plugins: []
};

module.exports = webpackMerge(config, {
    watch: true,
    output: {
        path: './output',
        publicPath: './',
        filename: '[name].js',
    },

    htmlLoader: {
        minimize: true
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin()
    ]
});
