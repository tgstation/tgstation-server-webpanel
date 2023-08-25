export enum TgsComponent {
    Configuration = "Configuration",
    Core = "Core",
    HostWatchdog = "HostWatchdog",
    WebControlPanel = "WebControlPanel",
    HttpApi = "HttpApi",
    DreamMakerApi = "DreamMakerApi",
    InteropApi = "InteropApi",
    NugetCommon = "NugetCommon",
    NugetApi = "NugetApi",
    NugetClient = "NugetClient"
}

interface Change {
    Descriptions: string[];
    Author: string;
    PullRequest: number;
}

type ComponentVersionMap = {
    [key in TgsComponent]: string;
};

export interface Changelist {
    Version: string;
    ComponentVersions?: ComponentVersionMap;
    Changes?: Change[];
    Unreleased?: boolean;
}

type ComponentMap = {
    [key in TgsComponent]: Changelist[];
};

export default interface TGSChangelog {
    Components: ComponentMap;
}
