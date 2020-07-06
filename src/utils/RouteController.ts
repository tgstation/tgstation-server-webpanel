import { AppRoute, AppRoutes, NormalRoute } from './routes';
import { TypedEmitter } from 'tiny-typed-emitter/lib';
import LoginHooks from '../ApiClient/util/LoginHooks';

interface IEvents {
    refresh: (routes: Array<AppRoute>) => void; //hidden+visible auth
    refreshVisible: (routes: Array<NormalRoute>) => void; //visible auth
    refreshAll: (routes: Array<AppRoute>) => void; //hidden+visible noauth+auth
    refreshAllVisible: (routes: Array<NormalRoute>) => void; //visible noauth+auth
}

//helper class to process AppRoutes
class RouteController extends TypedEmitter<IEvents> {
    private refreshing = false;

    public constructor() {
        super();
        this.refreshRoutes = this.refreshRoutes.bind(this);

        LoginHooks.addHook(this.refreshRoutes);
        // noinspection JSIgnoredPromiseFromCall
        this.refreshRoutes();
    }

    public async refreshRoutes() {
        if (this.refreshing) {
            console.log('Already refreshing');
            return;
        } //no need to refresh twice

        this.refreshing = true;

        const work = []; //    we get all hidden routes no matter the authentification without waiting for the refresh
        const routes = await this.getRoutes(true, false, false);

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

        this.emit('refresh', await this.getRoutes(true, false));
        this.emit('refreshVisible', (await this.getRoutes(false, false)) as Array<NormalRoute>);
        this.emit('refreshAll', await this.getRoutes(true, false, false));
        this.emit(
            'refreshAllVisible',
            (await this.getRoutes(false, false, false)) as Array<NormalRoute>
        );
        this.refreshing = false;

        console.log('Routes refreshed', await this.getRoutes(true, true, false));
        return await this.getRoutes();
    }

    private wait4refresh() {
        return new Promise<void>(resolve => {
            if (!this.refreshing) {
                resolve();
                return;
            }
            this.on('refresh', () => {
                resolve();
            });
        });
    }

    public async getRoutes(hidden = true, wait = true, auth = true): Promise<AppRoute[]> {
        if (wait) await this.wait4refresh();

        const results: Array<AppRoute> = [];

        const propNames = Object.getOwnPropertyNames(AppRoutes);
        for (let i = 0; i < propNames.length; i++) {
            const name = propNames[i];
            const val = AppRoutes[name];

            //we check for isauthorized here without calling because routes that lack the function are public
            if (val.isAuthorized && !val.cachedAuth && auth) continue; //if not authorized and we only show authorized routes
            if (val.hidden && !hidden) continue; //if its hidden and we dont show hidden routes

            results.push(val);
        }

        return results;
    }

    //bullshit wrapper because of types
    public async getVisibleRoutes(wait = true, auth = true) {
        return (await this.getRoutes(false, wait, auth)) as Array<NormalRoute>;
    }
}

export default new RouteController();
