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

export { getSavedCreds };
