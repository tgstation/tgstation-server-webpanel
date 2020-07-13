import { Components } from "../generatedcode/_generated";

class LoginHooks {
    private promiseHooks: Set<(token: Components.Schemas.Token) => Promise<unknown>> = new Set();

    public async runHooks(token: Components.Schemas.Token) {
        console.log("Running login hooks");
        const work: Promise<unknown>[] = [];
        for (const hook of this.promiseHooks) {
            work.push(hook(token));
        }
        await Promise.all(work);
        console.log("Done running login hooks");
    }

    public addHook(hook: (token: Components.Schemas.Token) => Promise<unknown>): void {
        this.promiseHooks.add(hook);
    }

    public removeHook(hook: (token: Components.Schemas.Token) => Promise<unknown>): void {
        this.promiseHooks.delete(hook);
    }
}

export default new LoginHooks();
