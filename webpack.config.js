const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
    entry: {
        index: './src/index'
    },
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].js'
    },
    resolve: {
        alias: {

        },
        extensions: ['.js', '.json', '.styl', '.css', '.html']
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                loader: 'babel-loader',
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.html/,
                loader: 'html-loader',
                query: {
                    minimize: false
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
            },
            {
                test: /\.styl$/,
                loaders: ['style-loader', 'css-loader', 'stylus-loader'],
            },
            {
                test: /\.(gif|png|jpe?g)$/i,
                loader: 'file-loader',
                query: {
                    name: 'images/[name].[ext]'
                }
            },
            {
                test: /\.woff2?$/,
                loader: 'url-loader',
                query: {
                    name: 'fonts/[name].[ext]',
                    limit: '10000',
                    mimetype: 'application/font-woff',
                }
            },
            {
                test: /\.(ttf|eot|svg)$/,
                loader: 'file-loader',
                query: {
                    name: 'fonts/[name].[ext]'
                }
            }
        ]
    },
    plugins: [

        new webpack.ContextReplacementPlugin(
            /\.\/locale$/, 'empty-module', false, /js$/
        ),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'index.html')
        }),

    ],

    devServer: {
        contentBase: './src',
        historyApiFallback: true,
        port: 8900,
        stats: {
            colors: true
        },
    }

};

if (!(process.env.WEBPACK_ENV === 'production')) {

    config.devtool = 'source-map';

    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            'WEBPACK_ENV': '"dev"'
        })
    ]);

}
else {
    config.plugins = config.plugins.concat([

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            },
            comments: false
        }),

        new webpack.DefinePlugin({
            'WEBPACK_ENV': '"production"'
        })

    ]);
}

module.exports = config;
