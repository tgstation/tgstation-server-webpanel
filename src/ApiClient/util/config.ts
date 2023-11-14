import { DEFAULT_APIPATH, MODE } from "../../definitions/constants";

export type ConfigValue = number | string | boolean;

export type ConfigOption = BaseConfigOption &
    (NumConfigOption | StrConfigOption | PwdConfigOption | BoolConfigOption | EnumConfigOption);

export interface BaseConfigOption {
    id: string;
    site_local?: boolean;
}

export interface NumConfigOption extends BaseConfigOption {
    type: "num";
    value: number;
    min?: number;
    max?: number;
    callback?: (oldValue: number, newValue: number) => void;
}
export interface StrConfigOption extends BaseConfigOption {
    type: "str";
    value: string;
    callback?: (oldValue: string, newValue: string) => void;
}
export interface PwdConfigOption extends BaseConfigOption {
    type: "pwd";
    value: string;
    callback?: (oldValue: string, newValue: string) => void;
}
export interface BoolConfigOption extends BaseConfigOption {
    type: "bool";
    value: boolean;
    callback?: (oldValue: boolean, newValue: boolean) => void;
}
export interface EnumConfigOption extends BaseConfigOption {
    type: "enum";
    possibleValues: Record<string, string>;
    value: string;
    callback?: (oldValue: string, newValue: string) => void;
}

export type ConfigMap = {
    [key: string]: ConfigOption;
};

export enum jobsWidgetOptions {
    ALWAYS = "always",
    AUTO = "auto",
    NEVER = "never"
}

export enum InstanceEditSidebar {
    AUTO = "auto",
    COLLAPSE = "collapse",
    EXPAND = "expand"
}

//https://stackoverflow.com/questions/54598322/how-to-make-typescript-infer-the-keys-of-an-object-but-define-type-of-its-value
//Infer the keys but restrict the values to a type
const asElementTypesConfig = <Type>(
    elements: {
        [Property in keyof Type]: ConfigOption;
    }
) => elements;

const configOptions = asElementTypesConfig({
    githubtoken: {
        id: "config.githubtoken",
        type: "pwd",
        value: ""
    },
    apipath: {
        id: "config.apipath",
        type: "str",
        site_local: true,
        value:
            MODE === "DEV"
                ? DEFAULT_APIPATH
                : window.publicPath
                ? new URL("..", new URL(window.publicPath, window.location.href)).href
                : DEFAULT_APIPATH
    },
    jobpollinactive: {
        id: "config.jobpollinactive",
        type: "num",
        value: 15
    },
    jobpollactive: {
        id: "config.jobpollactive",
        type: "num",
        value: 5
    },
    jobswidgetdisplay: {
        id: "config.jobswidgetdisplay",
        type: "enum",
        possibleValues: jobsWidgetOptions,
        value: jobsWidgetOptions.AUTO
    },
    instanceprobetimer: {
        id: "config.instanceprobetimer",
        type: "num",
        value: 60
    },
    itemsperpage: {
        id: "config.itemsperpage",
        type: "num",
        value: 25,
        min: 1,
        max: 100
    },
    instanceeditsidebar: {
        id: "config.instanceeditsidebar",
        type: "enum",
        possibleValues: InstanceEditSidebar,
        value: InstanceEditSidebar.AUTO
    },
    showjson: {
        id: "config.showjson",
        type: "bool",
        value: MODE === "DEV"
    },
    manualpr: {
        id: "config.manualpr",
        type: "bool",
        value: true
    },
    restjobs2: {
        id: "config.restjobs2",
        type: "bool",
        value: false
    }
});

export default configOptions;
