const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { createBabelConfig } = require('./babel.config.js');
const { DefinePlugin } = require("webpack");
const JSONManifestPlugin = require("./jsonmanifest-plugin");
const { version } = require("./package.json");

const createStats = verbose => ({
    assets: verbose,
    builtAt: verbose,
    cached: false,
    children: false,
    chunks: false,
    colors: true,
    entrypoints: true,
    hash: false,
    modules: false,
    performance: false,
    timings: verbose,
    version: verbose,
});

const TGS_WEBPANEL_GITHUB_PATH = "https://tgstation.github.io/tgstation-server-webpanel/webpanel/" + version + "/";

module.exports = (env, argv) => {
    const github = env.GITHUB_CD;
    const prodLike = (github || argv.mode === "production");
    const publicPath = (github ? TGS_WEBPANEL_GITHUB_PATH : (prodLike ? "/app/" : "/"));

    return {
        context: path.resolve(__dirname),
        // Our application entry point.
        entry: {
            main: [
                "./src",
            ],
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: createBabelConfig({ mode: argv.mode }),
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: ["style-loader", "css-loader"],
                    sideEffects: true,
                },
                {
                    test: /\.(scss)$/,
                    use: ["style-loader", "css-loader", "postcss-loader", "fast-sass-loader"],
                    sideEffects: true,
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource',
                    generator: {
                        publicPath: publicPath
                    }
                },
            ],
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            // polyfill
            fallback: {
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify"),
                buffer: require.resolve("buffer"),
                util: require.resolve("util"),
            },
        },

        output: {
            path: path.resolve(__dirname, "./dist"), // cwp cant read this, it's dumb (even though this is the default as of wbpack5)
            publicPath: publicPath,
            filename: `[name]${prodLike ? ".[contenthash]" : ""}.bundle.js`,
            chunkLoadTimeout: 15000,
            clean: true,
        },
        cache: {
            type: 'filesystem',
            cacheLocation: path.resolve(__dirname, `.yarn/webpack/${argv.mode}`),
            buildDependencies: {
                config: [__filename],
            },
        },

        optimization: {
            emitOnErrors: false,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        output: {
                            ascii_only: true,
                            comments: false,
                        },
                    },
                }),
            ],
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    packages: {
                        test: /[\\/]node_modules[\\/]/,
                        idHint: 'packages',
                    },
                    api: {
                        priority: 1,
                        test: /[\\/]ApiClient[\\/]/,
                        idHint: 'api',
                        enforce: true,
                    },
                    styles: {
                        test: /\.(scss)$/,
                        idHint: 'styles',
                        enforce: true,
                    },
                },
            },
        },

        devServer: {
            static: path.join(__dirname, "dist"),
            compress: true,
            hot: true,
            host: "0.0.0.0", // technically insecure? don't put nudes in your app, helps to test with mobile
            port: 8080,
            historyApiFallback: true,
            stats: createStats(false),
        },

        stats: createStats(true),

        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: "public",
                        toType: "dir",
                        globOptions: {
                            ignore: (prodLike
                                ? ["**/channel.json"]
                                : [])
                        },
                    },
                ],
            }),
            new ForkTsCheckerWebpackPlugin(),
            new DefinePlugin({
                'API_VERSION': JSON.stringify(
                    require("./src/ApiClient/generatedcode/swagger.json").info.version
                ),
                'VERSION': JSON.stringify(
                    github ? env.GITHUB_SHA : require("./package.json").version
                ),
                'MODE': JSON.stringify(prodLike ? (github ? "GITHUB" : "PROD") : "DEV"),
                // The basepath remains /app because its for the router which is located at /app/
                'DEFAULT_BASEPATH': JSON.stringify(prodLike ? "/app/" : "/"),
                'DEFAULT_APIPATH': JSON.stringify(prodLike ? "/" : "http://localhost:5000/"),
            }),
            (!github && new HtmlWebPackPlugin({
                title: "TGS Webpanel v" + require("./package.json").version,
                filename: "index.html",
                template: "./src/index.html",
                inject: false,
                publicPath: publicPath,
            })),
            (argv.mode !== 'production' && new ReactRefreshWebpackPlugin({
                overlay: {
                    sockIntegration: "wds",
                },
            })),
            new JSONManifestPlugin({version: require("./package.json").version })
        ].filter(Boolean),
    }
};
