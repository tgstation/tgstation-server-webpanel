export type ConfigValue = number | string | boolean | undefined;

export interface ConfigOption {
    id: string;
    type: "num" | "str" | "pwd" | "bool";
    value: ConfigValue;
    //persist?: boolean;
}

export type ConfigMap = {
    [key: string]: ConfigOption;
};

const configOptions: ConfigMap = {
    githubtoken: {
        id: "config.githubtoken",
        type: "pwd",
        value: ""
    },
    apipath: {
        id: "config.apipath",
        type: "str",
        value: "/"
    },
    basepath: {
        id: "config.basepath",
        type: "str",
        value: "/"
    }
};

export default configOptions;
