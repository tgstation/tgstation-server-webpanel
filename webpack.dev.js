const webpack = require('webpack');

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const profile = false;

let smp;

if (profile) {
    smp = new SpeedMeasurePlugin({
        granularLoaderData: false
    });
} else {
    smp = {
        wrap: function (thing) {
            return thing;
        }
    };
}

module.exports = smp.wrap(
    merge(common, {
        mode: 'development',
        devtool: 'source-map',

        output: {
            publicPath: '/',
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

        module: {
            rules: [
                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                {
                    enforce: 'pre',
                    exclude: /node_modules/,
                    test: /\.js$/,
                    loader: 'source-map-loader'
                }
            ]
        },

        plugins: [
            new webpack.HotModuleReplacementPlugin({}),
            new webpack.DefinePlugin({
                API_VERSION: JSON.stringify(require('./package.json').tgs_api_version),
                VERSION: JSON.stringify(require('./package.json').version),
                MODE: JSON.stringify('DEV'),
                BASEPATH: JSON.stringify('/'),
                APIPATH: JSON.stringify('http://localhost.fiddler:5000/')
            })
        ]
    })
);
