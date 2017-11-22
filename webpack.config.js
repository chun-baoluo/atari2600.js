const webpack = require('webpack');

module.exports = (env={ type: 'dev'}) => {
    let plugins = [
        new webpack.NoEmitOnErrorsPlugin()
    ];
    
    return {
        entry: {
            app: __dirname + '/dev/index.ts'
        },

        resolve: {
            extensions: ['*', '.ts']
        },

        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /dev-old/
                }
            ]
        },
        output: {
            path: __dirname + '/output',
            publicPath: './',
            filename: '[name].js',
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
