export type ConfigValue = number | string | boolean | undefined;

export interface ConfigOption {
    id: string;
    type: 'num' | 'str' | 'bool';
    value: ConfigValue;
    //persist?: boolean;
}

export type ConfigMap = {
    [key: string]: ConfigOption;
};

const configOptions: ConfigMap = {
    githubtoken: {
        id: 'config.githubtoken',
        type: 'str',
        value: ''
    },
    localstoragecreds: {
        id: 'config.localstoragecreds',
        type: 'bool',
        value: false
    }
};

export default configOptions;
