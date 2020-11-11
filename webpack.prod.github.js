const HtmlWebpackPlugin = require("html-webpack-plugin");

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

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

const publicPath = process.env.TGS_OVERRIDE_DEFAULT_BASEPATH || "/tgstation-server-control-panel//";

module.exports = smp.wrap(
    merge(common, {
        mode: "production",
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    test: /\.[jt]sx?$/
                })
            ],
            splitChunks: {
                cacheGroups: {
                    chunks: "all",
                    packages: {
                        maxInitialRequests: Infinity,
                        minSize: 5000,
                        priority: 3,
                        test: new RegExp("[\\/]node_modules[\\/]"),
                        name(module) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName
                            const packageName = module.context.match(
                                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                            )[1];

                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `vendors/npm.${packageName.replace("@", "")}`;
                        }
                    }
                }
            }
        },
        output: {
            publicPath: publicPath,
            filename: "[name].[contenthash].js",
            path: path.resolve(__dirname, "dist")
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            /*new webpack.debug.ProfilingPlugin({
                outputPath: 'profile.json'
            }),*/
            new webpack.DefinePlugin({
                API_VERSION: JSON.stringify(require("./package.json").tgs_api_version),
                VERSION: JSON.stringify(require("./package.json").version),
                MODE: JSON.stringify("PROD-GITHUB"),
                DEFAULT_BASEPATH: JSON.stringify(publicPath),
                //Fake hardcoded path that throws a unique error message prompting the user to change the configuration
                DEFAULT_APIPATH: JSON.stringify("https://example.org:5000")
            }),
            new HtmlWebpackPlugin({
                title: "TG Server Control Panel v0.4.0",
                filename: "index.html",
                template: "src/index-github.html"
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: "src/404.html",
                        toType: "dir"
                    }
                ]
            })
        ]
    })
);
