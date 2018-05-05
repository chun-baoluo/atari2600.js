const webpack = require('webpack');

module.exports = (env={ type: 'dev'}) => {
    let plugins = [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
    ];

    return {
        entry: {
            app: __dirname + '/dev/App.ts'
        },

        resolve: {
            extensions: ['*', '.ts']
        },

        module: {
            rules: [{
                    test: /\.ts$/,
                    loader: 'ts-loader'
            }]
        },

        output: {
            path: __dirname + '/output',
            publicPath: '/',
            filename: '[name].js',
            libraryTarget: "umd",
            library: 'atari2600'
        },

        plugins: plugins,

        watch: env.type == 'dev'
    };
};
