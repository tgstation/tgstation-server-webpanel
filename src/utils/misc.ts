import { pathToRegexp } from "path-to-regexp";

import {
    AdministrationRights,
    ByondRights,
    ChatBotRights,
    ConfigurationRights,
    DreamDaemonRights,
    DreamMakerRights,
    InstanceManagerRights,
    InstancePermissionSetRights,
    RepositoryRights
} from "../ApiClient/generatedcode/_enums";
import {
    InstancePermissionSetResponse,
    PermissionSet,
    UserResponse
} from "../ApiClient/generatedcode/schemas";

export type DistributiveOmit<T, K extends keyof T> = T extends T ? Omit<T, K> : never;

function download(filename: string, text: string): void {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function replaceAll(str: string, find: string, replace: string, ignore?: boolean): string {
    return str.replace(
        new RegExp(find.replace(/([/,!\\^${}[\]().*+?|<>\-&])/g, "\\$&"), ignore ? "gi" : "g"),
        replace.replace(/\$/g, "$$$$")
    );
}

function matchesPath(path: string, target: string, exact = false): boolean {
    //remove trailing slashes
    if (path.slice(-1) === "/") path = path.slice(0, -1);
    if (target.slice(-1) === "/") target = target.slice(0, -1);

    return pathToRegexp(target, undefined, { end: exact }).test(path);
}

function resolvePermissionSet(user: UserResponse): PermissionSet {
    return (user.permissionSet ?? user.group?.permissionSet) as PermissionSet;
}

function bitflagIsTrue(bitfield: number, bitflag: number): boolean {
    return !!(bitflag & bitfield);
}

function hasAdminRight(permissionSet: PermissionSet, right: AdministrationRights): boolean {
    return bitflagIsTrue(permissionSet.administrationRights, right);
}

function hasInstanceManagerRight(
    permissionSet: PermissionSet,
    right: InstanceManagerRights
): boolean {
    return bitflagIsTrue(permissionSet.instanceManagerRights, right);
}

function hasByondRight(permissionSet: InstancePermissionSetResponse, right: ByondRights): boolean {
    return bitflagIsTrue(permissionSet.byondRights, right);
}

function hasChatBotRight(
    permissionSet: InstancePermissionSetResponse,
    right: ChatBotRights
): boolean {
    return bitflagIsTrue(permissionSet.chatBotRights, right);
}

function hasConfigRight(
    permissionSet: InstancePermissionSetResponse,
    right: ConfigurationRights
): boolean {
    return bitflagIsTrue(permissionSet.configurationRights, right);
}

function hasDreamDaemonRight(
    permissionSet: InstancePermissionSetResponse,
    right: DreamDaemonRights
): boolean {
    return bitflagIsTrue(permissionSet.dreamDaemonRights, right);
}

function hasDreamMakerRight(
    permissionSet: InstancePermissionSetResponse,
    right: DreamMakerRights
): boolean {
    return bitflagIsTrue(permissionSet.dreamMakerRights, right);
}

function hasInstancePermRight(
    permissionSet: InstancePermissionSetResponse,
    right: InstancePermissionSetRights
): boolean {
    return bitflagIsTrue(permissionSet.instancePermissionSetRights, right);
}

function hasRepoRight(
    permissionSet: InstancePermissionSetResponse,
    right: RepositoryRights
): boolean {
    return bitflagIsTrue(permissionSet.repositoryRights, right);
}

export {
    download,
    replaceAll,
    matchesPath,
    resolvePermissionSet,
    bitflagIsTrue,
    hasAdminRight,
    hasByondRight,
    hasConfigRight,
    hasRepoRight,
    hasChatBotRight,
    hasInstancePermRight,
    hasInstanceManagerRight,
    hasDreamMakerRight,
    hasDreamDaemonRight
};
