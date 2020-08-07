import { IconProp } from "@fortawesome/fontawesome-svg-core";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import UserClient from "../ApiClient/UserClient";
import { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import { AdministrationRights } from "../ApiClient/generatedcode/_enums";

export interface AppRoute {
    //Base parameters
    name: string; //must be unique, also is the id of the route name message
    route: string; //must be unique, url to access
    file: string; //filename in components/view that the route should display

    //Path parameters
    loose: boolean; //If subpaths should route here
    navbarLoose: boolean; //If subpaths should light up the navbar button

    //Authentication
    loginless?: boolean; //if we can route to it even on the login page
    isAuthorized: () => Promise<boolean>; //function to tell if we are authorized
    cachedAuth?: boolean; //result of isAuthorized() after RouteController runs it, can be used by components but only set by RouteController

    //Visibility
    visibleNavbar: boolean; //if this shows up on the navbar
    homeIcon?: IconProp; //serves two purposes, first one is to give it an icon, the second one is to not display it if the icon is undefined
}

export const AppRoutes: {
    [id: string]: AppRoute;
} = {
    home: {
        name: "routes.home",
        route: "/",
        file: "Home",

        loose: false,
        navbarLoose: false,

        isAuthorized: (): Promise<boolean> => Promise.resolve(true),

        visibleNavbar: true,
        homeIcon: undefined
    },
    admin: {
        name: "routes.admin",
        route: "/admin/",
        file: "Administration",

        loose: false,
        navbarLoose: true,

        isAuthorized: (): Promise<boolean> => Promise.resolve(true),

        visibleNavbar: true,
        homeIcon: "tools"
    },
    admin_update: {
        name: "routes.admin.update",
        route: "/admin/update",
        file: "Admin/Update",

        loose: false,
        navbarLoose: false,

        isAuthorized: async (): Promise<boolean> => {
            if (!CredentialsProvider.isTokenValid()) return false;
            const response = await UserClient.getCurrentUser();

            if (response.code == StatusCode.OK) {
                return !!(
                    response.payload!.administrationRights & AdministrationRights.ChangeVersion
                );
            }
            return false;
        },
        visibleNavbar: true,
        homeIcon: undefined
    },
    config: {
        name: "routes.config",
        route: "/config/",
        file: "Configuration",

        loose: true,
        navbarLoose: false,

        loginless: true,
        isAuthorized: (): Promise<boolean> => Promise.resolve(true),

        visibleNavbar: false,
        homeIcon: "cogs"
    }
};
