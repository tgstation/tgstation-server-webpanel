import { IconProp } from "@fortawesome/fontawesome-svg-core";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import UserClient from "../ApiClient/UserClient";
import { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import { AdministrationRights } from "../ApiClient/generatedcode/_enums";

export interface AppRoute {
    ///Base parameters
    //must be unique, also is the id of the route name message
    name: string;
    //must be unique, url to access
    route: string;
    //link to link to when linking to the route, defaults to the "route"
    link?: string;
    //filename in components/view that the route should display
    file: string;

    ///Path parameters
    //If subpaths should route here
    loose: boolean;
    //If subpaths should light up the navbar button
    navbarLoose: boolean;

    ///Authentication
    //if we can route to it even on the login page
    loginless?: boolean;
    //function to tell if we are authorized
    isAuthorized: () => Promise<boolean>;
    //result of isAuthorized() after RouteController runs it, can be used by components but only set by RouteController
    cachedAuth?: boolean;

    ///Visibility
    //if this shows up on the navbar
    visibleNavbar: boolean;
    //serves two purposes, first one is to give it an icon, the second one is to not display it if the icon is undefined
    homeIcon?: IconProp;

    ///Categories
    //name of the category it belongs to
    category?: string;
    //if this is the main button in the category
    catleader?: boolean;
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
        homeIcon: undefined,

        category: "home",
        catleader: true
    },
    admin: {
        name: "routes.admin",
        route: "/admin/",
        file: "Administration",

        loose: false,
        navbarLoose: true,

        isAuthorized: (): Promise<boolean> => Promise.resolve(true),

        visibleNavbar: true,
        homeIcon: "tools",

        category: "admin",
        catleader: true
    },
    admin_update: {
        name: "routes.admin.update",
        route: "/admin/update/",
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
        homeIcon: undefined,

        category: "admin"
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

export type UnpopulatedAppCategory = Partial<AppCategory>;

export interface AppCategory {
    name: string; //doesnt really matter, kinda bullshit
    routes: AppRoute[];
    leader: AppRoute;
}

export type UnpopulatedAppCategories = {
    [key: string]: UnpopulatedAppCategory;
};

export type AppCategories = {
    [key: string]: AppCategory;
};

export const AppCategories: UnpopulatedAppCategories = {
    home: {
        name: "home"
    },
    admin: {
        name: "admin"
    }
};
