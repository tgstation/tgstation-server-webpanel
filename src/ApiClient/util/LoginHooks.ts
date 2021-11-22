import { TypedEmitter } from "tiny-typed-emitter";

import type { TokenResponse } from "../generatedcode/schemas";

interface IEvents {
    //tasks once the user is fully logged in
    loginSuccess: (token: TokenResponse) => void;
}

class LoginHooks extends TypedEmitter<IEvents> {
    private promiseHooks: Set<(token: TokenResponse) => Promise<unknown>> = new Set();

    public runHooks(token: TokenResponse) {
        console.log("Running login hooks");
        let i = 0;
        const work: Array<Promise<void>> = [];
        for (const hook of this.promiseHooks) {
            const id = i;
            console.log(`Running hook ${hook.name}(${id})`);
            work.push(
                new Promise<void>((resolve, reject) => {
                    hook(token)
                        .then(() => {
                            console.log(`Done hook ${hook.name}(${id})`);
                            resolve();
                        })
                        .catch(err => {
                            console.error(`Error running hook ${hook.name}(${id}): `, err);
                            reject(err);
                        });
                })
            );
            i++;
        }
        Promise.all(work)
            .then(() => {
                console.log("Running post login event");
                this.emit("loginSuccess", token);
            })
            .catch(() => console.error("An error occured while running login hooks"));
    }

    public addHook(hook: (token: TokenResponse) => Promise<unknown>): void {
        this.promiseHooks.add(hook);
    }

    public removeHook(hook: (token: TokenResponse) => Promise<unknown>): void {
        this.promiseHooks.delete(hook);
    }
}

export default new LoginHooks();
