const webpack = require("webpack");

module.exports = class JSONManifestPlugin {
    constructor(options) {
        this.version = options.version;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap("JSONManifestPlugin", compilation => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: "JSONManifestPlugin",
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
                },
                async () => {
                    const result = { manifestVersion: 1, version: this.version, entries: [] };

                    for (const entrypoint of compilation.entrypoints.values()) {
                        for (const chunk of entrypoint.chunks) {
                            result.entries = result.entries.concat(
                                [...chunk.files.values()].filter(
                                    val => val.endsWith(".js") && !val.endsWith(".hot-update.js")
                                )
                            );
                        }
                    }

                    const processed = JSON.stringify(result);

                    compilation.assets["webpanelmanifest.json"] = {
                        source: () => {
                            return processed;
                        },
                        size: () => {
                            return processed.length;
                        }
                    };
                }
            );
        });
    }
};
