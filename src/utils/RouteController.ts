import { AppRoute, AppRoutes } from "./routes";
import { TypedEmitter } from "tiny-typed-emitter/lib";
import LoginHooks from "../ApiClient/util/LoginHooks";
import ServerClient from "../ApiClient/ServerClient";

interface IEvents {
    refresh: (routes: Array<AppRoute>) => void; //auth
    refreshAll: (routes: Array<AppRoute>) => void; //noauth+auth
}

//helper class to process AppRoutes
class RouteController extends TypedEmitter<IEvents> {
    private refreshing = false;

    public constructor() {
        super();
        this.refreshRoutes = this.refreshRoutes.bind(this);

        ServerClient.on("purgeCache", () => this.refreshRoutes);
        LoginHooks.addHook(this.refreshRoutes);
        this.refreshRoutes().catch(console.error);
    }

    public async refreshRoutes() {
        if (this.refreshing) {
            console.log("Already refreshing");
            return;
        } //no need to refresh twice

        this.refreshing = true;

        const work = []; //    we get all hidden routes no matter the authentification without waiting for the refresh
        const routes = this.getImmediateRoutes(false);

        for (const route of routes) {
            route.cachedAuth = undefined;
            if (route.isAuthorized) {
                work.push(
                    route.isAuthorized().then(auth => {
                        route.cachedAuth = auth;
                    })
                );
            }
        }

        await Promise.all(work); //wait for all the authorized calls to complete

        this.emit("refresh", this.getImmediateRoutes(true));
        const routesNoAuth = this.getImmediateRoutes(false);
        this.emit("refreshAll", routesNoAuth);
        this.refreshing = false;

        console.log("Routes refreshed", routesNoAuth);
        return await this.getRoutes();
    }

    private wait4refresh() {
        return new Promise<void>(resolve => {
            if (!this.refreshing) {
                resolve();
                return;
            }
            this.on("refresh", () => {
                resolve();
            });
        });
    }

    public async getRoutes(auth = true): Promise<AppRoute[]> {
        await this.wait4refresh();

        return this.getImmediateRoutes(auth);
    }

    public getImmediateRoutes(auth = true) {
        const results: Array<AppRoute> = [];

        const propNames = Object.getOwnPropertyNames(AppRoutes);
        for (let i = 0; i < propNames.length; i++) {
            const name = propNames[i];
            const val = AppRoutes[name];

            //we check for isauthorized here without calling because routes that lack the function are public
            if (val.isAuthorized && !val.cachedAuth && auth) continue; //if not authorized and we only show authorized routes

            results.push(val);
        }

        return results;
    }
}

export default new RouteController();
