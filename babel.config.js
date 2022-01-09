/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

const createBabelConfig = options => {
    const { mode, presets = [], plugins = [] } = options;
    if (mode === "development") {
        plugins.push(require.resolve("react-refresh/babel"));
    }
    return {
        presets: [
            [
                require.resolve("@babel/preset-typescript"),
                {
                    allowDeclareFields: true
                }
            ],
            require.resolve("@babel/preset-react"),
            ...presets
        ],
        plugins: [
            [
                require.resolve("@babel/plugin-transform-typescript"),
                {
                    allowDeclareFields: true
                }
            ],
            [
                require.resolve("@babel/plugin-proposal-class-properties"),
                {
                    loose: true
                }
            ],
            ...plugins
        ]
    };
};

module.exports = api => {
    api.cache(true);
    const mode = process.env.NODE_ENV;
    return createBabelConfig({ mode });
};

module.exports.createBabelConfig = createBabelConfig;
