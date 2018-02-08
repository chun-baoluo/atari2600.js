const webpack = require('webpack');

module.exports = (env={ type: 'dev'}) => {
    let plugins = [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
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
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                }
            ]
        },

        output: {
            path: __dirname + '/output',
            publicPath: '/',
            filename: '[name].js',
            libraryTarget: "var",
            library: 'Atari2600'
        },

        plugins: env.type == 'dev' ? plugins : plugins.concat([
            new webpack.optimize.UglifyJsPlugin({
                 beautify: false,
                 comments: false,
                 compress: {
                     sequences: true,
                     booleans: true,
                     loops: true,
                     unused: true,
                     warnings: false,
                     drop_console: true,
                     pure_getters: true,
                     unsafe: true,
                     unsafe_comps: true,
                     screw_ie8: true
                 }
             })
        ]),

        watch: env.type == 'dev'
    };



};
