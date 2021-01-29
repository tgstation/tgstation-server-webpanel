module.exports = class JSONManifestPlugin {
    constructor(options) {
        this.version = options.version;
    }

    apply(compiler) {
        compiler.hooks.emit.tapPromise('JSONManifestPlugin', async (compilation) => {
            const result = {manifestVersion: 1, version: this.version, entries: []};


            for(const entrypoint of compilation.entrypoints.values()) {
                for(const chunk of entrypoint.chunks) {
                    result.entries = result.entries.concat(chunk.files.filter(val => val.endsWith(".js")))
                }
            }

            const processed = JSON.stringify(result);

            compilation.assets["webpanelmanifest.json"] = {
                source: () => {
                    return processed
                },
                size: () => {
                    return processed.length;
                }
            };
            debugger;
        })
    }
}
