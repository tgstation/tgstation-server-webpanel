const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [new ForkTsCheckerWebpackPlugin()]
});
