import { IconProp } from "@fortawesome/fontawesome-svg-core";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import UserClient from "../ApiClient/UserClient";
import { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import { AdministrationRights } from "../ApiClient/generatedcode/_enums";

export interface BaseRoute {
    route: string; //must be unique
    name: string; //must be unique, also is the id of the route name message
    file: string; //path to the file in components/view that the route loads
    loose?: boolean; //if we care about subpaths
    navbarLoose?: boolean; //if the navbar button lights up if we are on a subpath
    isAuthorized: () => Promise<boolean>; //function to tell if we are authorized
    cachedAuth?: boolean; //result of isAuthorized() after RouteController runs it
    loginless?: boolean; //if we can route to it even on the login page
}

export interface NormalRoute extends BaseRoute {
    icon: IconProp; //name of the fontawesome icon on the home screen
    hidden?: false; //if it shows up in the navbar or the home screen
}

export interface HiddenRoute extends BaseRoute {
    hidden: true; //if it shows up in the navbar or the home screen
}

export type AppRoute = NormalRoute | HiddenRoute;

export const AppRoutes: {
    [id: string]: AppRoute;
} = {
    home: {
        route: "/",
        name: "routes.home",
        file: "Home",
        icon: "home",
        isAuthorized: (): Promise<boolean> => Promise.resolve(true)
    },
    /*
    instances: {
        route: "/Instance/",
        name: "routes.instances",
        icon: "hdd",
        isAuthorized: async () => false
    },
    userManager: {
        route: "/Users/",
        name: "routes.user_manager",
        icon: "user",
        isAuthorized: async () => false
    },
    */
    admin: {
        route: "/admin/",
        name: "routes.admin",
        file: "Administration",
        icon: "tools",
        navbarLoose: true,
        isAuthorized: (): Promise<boolean> => {
            /*if (!CredentialsProvider.isTokenValid()) return false;
            const response = await UserClient.getCurrentUser();

            if (response.code == StatusCode.OK) {
                return !!(
                    response.payload!.administrationRights &
                    (AdministrationRights.ChangeVersion | AdministrationRights.RestartHost)
                );
            }
            return false;*/
            //i realized everyone can GET /Administration so this is pretty useless
            return Promise.resolve(true);
        }
    },
    config: {
        route: "/config/",
        name: "routes.config",
        file: "Configuration",
        hidden: true,
        loginless: true,
        isAuthorized: (): Promise<boolean> => Promise.resolve(true)
    }
};
