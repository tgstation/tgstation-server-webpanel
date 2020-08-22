import { Components } from "../generatedcode/_generated";

class LoginHooks {
    private promiseHooks: Set<(token: Components.Schemas.Token) => Promise<unknown>> = new Set();

    public runHooks(token: Components.Schemas.Token) {
        console.log("Running login hooks");
        let i = 0;
        for (const hook of this.promiseHooks) {
            const id = i;
            console.log(`Running hook ${hook.name}(${id})`);
            hook(token)
                .then(arg => {
                    console.log(`Done hook ${hook.name}(${id})`);
                    return arg;
                })
                .catch(err => {
                    console.log(`Error running hook ${hook.name}(${id}): `, err);
                });
            i++;
        }
    }

    public addHook(hook: (token: Components.Schemas.Token) => Promise<unknown>): void {
        this.promiseHooks.add(hook);
    }

    public removeHook(hook: (token: Components.Schemas.Token) => Promise<unknown>): void {
        this.promiseHooks.delete(hook);
    }
}

export default new LoginHooks();
