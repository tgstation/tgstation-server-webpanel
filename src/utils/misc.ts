import { pathToRegexp } from "path-to-regexp";

import { Components } from "../ApiClient/generatedcode/_generated";

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

function resolvePermissionSet(
    user: Components.Schemas.UserResponse
): Components.Schemas.PermissionSet {
    return (user.permissionSet || user.group?.permissionSet) as Components.Schemas.PermissionSet;
}

export { download, replaceAll, matchesPath, resolvePermissionSet };
