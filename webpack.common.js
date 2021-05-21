const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const JSONManifestPlugin = require("./webpack-plugin");

module.exports = function createConfig(prodLike, github) {
    const publicPath = process.env.TGS_WEBPANEL_GITHUB_PATH || (prodLike ? "/app/" : "/");
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
            clean: true,
            publicPath: publicPath,
            filename: `[name]${prodLike ? ".[contenthash]" : ""}.js`,
            path: path.resolve(__dirname, "dist")
        },

        optimization: {
            minimize: prodLike,
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    packages: {
                        test: /[\\/]node_modules[\\/]/,
                        idHint: "packages"
                    },
                    api: {
                        priority: 1,
                        test: /[\\/]ApiClient[\\/]/,
                        idHint: "api",
                        enforce: true
                    },
                    styles: {
                        test: /\.(scss)$/,
                        idHint: "styles",
                        enforce: true
                    }
                }
            },
            runtimeChunk: "single"
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
            symlinks: false,
            fallback: {
                fs: false,
                util: require.resolve("util"),
                buffer: require.resolve("buffer/"),
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify"),
                process: "process/browser"
            }
        },

        module: {
            rules: [
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: ["style-loader", "css-loader"],
                    sideEffects: true
                },
                {
                    test: /\.(scss)$/,
                    use: ["style-loader", "css-loader", "postcss-loader", "fast-sass-loader"],
                    sideEffects: true
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: "asset/resource"
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
                                ["@babel/plugin-transform-typescript", {allowDeclareFields: true}],
                                ["@babel/plugin-proposal-class-properties", { loose: true }],
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
                    use: "source-map-loader"
                }
            ]
        },

        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: "public",
                        toType: "dir",
                        globOptions: {
                            ignore: prodLike ? ["**/channel.json"] : []
                        }
                    }
                ]
            }),
            new ForkTsCheckerWebpackPlugin(),
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
                process: 'process/browser'
            }),
            new webpack.DefinePlugin({
                API_VERSION: JSON.stringify(require("./src/ApiClient/generatedcode/swagger.json").info.version),
                VERSION: JSON.stringify(github ? process.env.GITHUB_SHA : require("./package.json").version),
                MODE: JSON.stringify(prodLike ? (github ? "GITHUB" : "PROD") : "DEV"),
                //The basepath remains /app because its for the router which is located at /app/
                DEFAULT_BASEPATH: JSON.stringify(github ? "/app/" : publicPath),
                DEFAULT_APIPATH: JSON.stringify(prodLike ? "/" : "http://localhost:5000/")
            }),
            github ? false : new HtmlWebpackPlugin({
                title: "TGS Webpanel v" + require("./package.json").version,
                filename: "index.html",
                template: "src/index.html",
                inject: false,
                publicPath: github ? process.env.TGS_WEBPANEL_GITHUB_PATH : prodLike ? "/app/" : "/"
            }),
            isDevelopment &&
                new ReactRefreshWebpackPlugin({
                    overlay: {
                        sockIntegration: "wds"
                    }
                }),
            new JSONManifestPlugin({version: require("./package.json").version })
        ].filter(Boolean)
    };
};
