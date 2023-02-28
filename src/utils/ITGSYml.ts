import { DreamDaemonSecurity } from "../ApiClient/generatedcode/generated";

interface IStaticFile {
    name: string;
    populate?: boolean;
}

export function getTGSYmlSecurity(yml: ITGSYml): DreamDaemonSecurity | null {
    switch (yml.security?.toLowerCase()) {
        case "ultrasafe":
            return DreamDaemonSecurity.Ultrasafe;
        case "safe":
            return DreamDaemonSecurity.Safe;
        case "trusted":
            return DreamDaemonSecurity.Trusted;
        default:
            return null;
    }
}

export default interface ITGSYml {
    version: number;
    byond?: string;
    static_files?: IStaticFile[];
    linux_scripts?: Map<string, string>;
    windows_scripts?: Map<string, string>;
    security?: string;
}
