const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function createConfig(prodLike, github = false) {
    const publicPath = process.env.TGS_OVERRIDE_DEFAULT_BASEPATH || (prodLike ? "/app/" : "/");
    const isDevelopment = !prodLike;

    return {
        mode: isDevelopment ? "development" : "production",
        devtool: "source-map",

        context: __dirname,
        entry: {
            //babel: '@babel/polyfill',
            main: "./src/index.tsx"
        },

        output: {
            publicPath: publicPath,
            filename: `[name]${prodLike ? ".[contenthash]" : ""}.js`,
            path: path.resolve(__dirname, "dist")
        },

        optimization: {
            minimize: prodLike,
            minimizer: [
                new TerserPlugin({
                    test: /\.[jt]sx?$/
                })
            ],
            runtimeChunk: "single",
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    packages: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "packages"
                    },
                    api: {
                        priority: 1,
                        test: /[\\/]ApiClient[\\/]/,
                        enforce: true
                    }
                }
            }
        },

        devServer: {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            hot: true,
            overlay: true,
            host: "0.0.0.0", //technically insecure? don't put nudes in your app, helps to test with mobile
            port: 8080,
            historyApiFallback: true
        },

        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            symlinks: false
        },

        module: {
            rules: [
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    loader: ["style-loader", "css-loader"],
                    sideEffects: true
                },
                {
                    test: /\.(scss)$/,
                    use: [
                        {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: function () {
                                    return [require("autoprefixer")];
                                }
                            }
                        },
                        {
                            loader: "fast-sass-loader"
                        }
                    ],
                    sideEffects: true
                },
                {
                    test: /\.svg$/,
                    exclude: /node_modules/,
                    loader: "svg-loader"
                },
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            babelrc: false,
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        modules: false,
                                        exclude: ["transform-regenerator"]
                                    }
                                ],
                                "@babel/preset-typescript",
                                "@babel/preset-react"
                            ],
                            plugins: [
                                ["@babel/plugin-proposal-class-properties", { loose: true }],
                                /*[
                                    '@babel/plugin-transform-runtime',
                                    {
                                        regenerator: false
                                    }
                                ],*/
                                isDevelopment && require.resolve("react-refresh/babel")
                            ].filter(Boolean)
                        }
                    }
                },
                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                {
                    enforce: "pre",
                    exclude: /node_modules/,
                    test: /\.js$/,
                    loader: "source-map-loader"
                }
            ]
        },

        plugins: [
            new CleanWebpackPlugin(),
            new CopyPlugin({
                patterns: [
                    {
                        from: "public",
                        toType: "dir"
                    }
                ]
            }),
            new ForkTsCheckerWebpackPlugin(),
            new webpack.DefinePlugin({
                API_VERSION: JSON.stringify(require("./package.json").tgs_api_version),
                VERSION: JSON.stringify(
                    github ? process.env.GITHUB_SHA : require("./package.json").version
                ),
                MODE: JSON.stringify(prodLike ? (github ? "PROD-GITHUB" : "PROD") : "DEV"),
                DEFAULT_BASEPATH: JSON.stringify(publicPath),
                DEFAULT_APIPATH: JSON.stringify(
                    prodLike ? (github ? "https://example.org:5000" : "http://localhost:5000/") : ""
                )
            }),
            new HtmlWebpackPlugin({
                title: "TGS Webpanel v" + require("./package.json").version,
                filename: "index.html",
                template: github ? "src/index-github.html" : "src/index.html"
            }),
            github
                ? new CopyPlugin({
                      patterns: [
                          {
                              from: "src/404.html",
                              toType: "dir"
                          }
                      ]
                  })
                : undefined,
            isDevelopment &&
                new ReactRefreshWebpackPlugin({
                    overlay: {
                        sockIntegration: "wds"
                    }
                })
        ].filter(Boolean),
        node: {
            fs: "empty"
        }
    };
};
