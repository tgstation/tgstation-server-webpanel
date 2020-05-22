const webpack = require('webpack');

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                packages: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'packages'
                }
            }
        }
    },

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        hot: true,
        overlay: true,
        port: 8080,
        historyApiFallback: true
    },

    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom'
        }
    },

    plugins: [new webpack.HotModuleReplacementPlugin({})]
});
