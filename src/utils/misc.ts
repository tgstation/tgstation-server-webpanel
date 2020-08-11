function getSavedCreds(): string[] | null {
    let usr: string | null = null;
    let pwd: string | null = null;
    try {
        //private browsing on safari can throw when using storage
        usr = window.sessionStorage.getItem("username") || window.localStorage.getItem("username");
        pwd = window.sessionStorage.getItem("password") || window.localStorage.getItem("password");
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        (() => {})(); //noop
    }

    if (usr && pwd) {
        return [usr, pwd];
    } else {
        return null;
    }
}

function download(filename: string, text: string): void {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
        return `${Math.floor(interval)} years`;
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return `${Math.floor(interval)} months`;
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return `${Math.floor(interval)} days`;
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return `${Math.floor(interval)} hours`;
    }
    interval = seconds / 60;
    if (interval > 1) {
        return `${Math.floor(interval)} minutes`;
    }
    return `${Math.floor(interval)} seconds`;
}

function replaceAll(str: string, find: string, replace: string, ignore?: boolean): string {
    return str.replace(
        new RegExp(find.replace(/([/,!\\^${}[\]().*+?|<>\-&])/g, "\\$&"), ignore ? "gi" : "g"),
        replace.replace(/\$/g, "$$$$")
    );
}

export { getSavedCreds, download, timeSince, replaceAll };
