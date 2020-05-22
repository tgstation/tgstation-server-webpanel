const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
    context: __dirname,
    entry: {
        babel: '@babel/polyfill',
        main: './src/index.tsx'
    },

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.[jt]sx?$/
            })
        ],
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                packages: {
                    maxInitialRequests: Infinity,
                    minSize: 5000,
                    priority: 3,
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                        )[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return path.join(
                            'vendors',
                            `npm.${packageName.replace('@', '')}`
                        );
                    }
                },
                api: {
                    priority: 1,
                    test: /[\\/]clients[\\/]generated[\\/]/,
                    enforce: true
                }
            }
        }
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        symlinks: false
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: ['style-loader', 'css-loader']
            },
            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                loader: 'svg-loader'
            },
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers:
                                            'last 5 chrome version, last 5 firefox version, last 3 edge version, last 2 ie version, last 5 opera version, last 3 safari version'
                                    }
                                } // or whatever your project requires
                            ],
                            '@babel/preset-typescript',
                            '@babel/preset-react'
                        ],
                        plugins: [
                            // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
                            [
                                '@babel/plugin-proposal-decorators',
                                { legacy: true }
                            ],
                            [
                                '@babel/plugin-proposal-class-properties',
                                { loose: true }
                            ],
                            'react-hot-loader/babel'
                        ]
                    }
                }
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: 'pre',
                test: /\.[jt]sx?$/,
                loader: 'source-map-loader'
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'TG Server Control Panel v0.4.0',
            filename: 'index.html',
            template: 'src/index.html'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    toType: 'dir'
                }
            ]
        })
    ]
};
