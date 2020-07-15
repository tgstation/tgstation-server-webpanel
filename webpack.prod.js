const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

const appPath = "/ctlpaneltest/";
const apiPath = "http://localhost:5000/";
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

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
        mode: "production",
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    test: /\.[jt]sx?$/
                })
            ]
        },
        output: {
            publicPath: appPath,
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
                MODE: JSON.stringify("PROD"),
                BASEPATH: JSON.stringify(appPath),
                APIPATH: JSON.stringify(apiPath)
            })
        ]
    })
);
