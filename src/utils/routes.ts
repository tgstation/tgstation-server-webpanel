import { IconProp } from "@fortawesome/fontawesome-svg-core";

import { AdministrationRights, InstanceManagerRights } from "../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import UserClient from "../ApiClient/UserClient";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import { resolvePermissionSet } from "./misc";

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
    isAuthorized?: () => Promise<boolean>;
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

    ///Misc
    //Should we not wrap this component in a <Container>?
    noContainer?: boolean;
}

function adminRight(right: AdministrationRights) {
    return async (): Promise<boolean> => {
        if (!CredentialsProvider.isTokenValid()) return false;
        const response = await UserClient.getCurrentUser();

        if (response.code == StatusCode.OK) {
            return !!(resolvePermissionSet(response.payload).administrationRights & right);
        }
        return false;
    };
}

function instanceManagerRight(right: InstanceManagerRights) {
    return async (): Promise<boolean> => {
        if (!CredentialsProvider.isTokenValid()) return false;
        const response = await UserClient.getCurrentUser();

        if (response.code == StatusCode.OK) {
            return !!(resolvePermissionSet(response.payload).instanceManagerRights & right);
        }
        return false;
    };
}
//https://stackoverflow.com/questions/54598322/how-to-make-typescript-infer-the-keys-of-an-object-but-define-type-of-its-value
//Infer the keys but restrict the values to a type
const asElementTypesAppRoute = <T>(et: { [K in keyof T]: AppRoute }) => et;

const AppRoutes = asElementTypesAppRoute({
    home: {
        name: "routes.home",
        route: "/",
        file: "Home",

        loose: false,
        navbarLoose: false,

        visibleNavbar: true,
        homeIcon: undefined,

        category: "home",
        catleader: true
    },
    instancecreate: {
        name: "routes.instancecreate",
        route: "/instances/create",
        file: "Instance/Create",

        loose: false,
        navbarLoose: false,

        isAuthorized: instanceManagerRight(InstanceManagerRights.Create),

        visibleNavbar: false,

        category: "instance",
        catleader: false
    },
    instancelist: {
        name: "routes.instancelist",
        route: "/instances/",
        file: "Instance/List",

        loose: false,
        navbarLoose: true,

        isAuthorized: instanceManagerRight(InstanceManagerRights.List | InstanceManagerRights.Read),

        visibleNavbar: true,
        homeIcon: "hdd",

        category: "instance",
        catleader: true
    },
    instanceedit: {
        name: "routes.instanceedit",
        route: "/instances/edit/:id(\\d+)/:tab?/",
        file: "Instance/InstanceEdit",

        get link(): string {
            return RouteData.selectedinstanceid !== undefined
                ? `/instances/edit/${RouteData.selectedinstanceid}/${
                      RouteData.selectedinstanceedittab !== undefined
                          ? `${RouteData.selectedinstanceedittab}/`
                          : ""
                  }`
                : AppRoutes.instancelist.link ?? AppRoutes.instancelist.route;
        },

        loose: false,
        navbarLoose: true,

        visibleNavbar: true,
        homeIcon: undefined,

        category: "instance"
    },
    instancejobs: {
        name: "routes.instancejobs",
        route: "/instances/jobs/",
        file: "Instance/Jobs",

        loose: false,
        navbarLoose: true,

        visibleNavbar: true,
        homeIcon: undefined,

        category: "instance"
    },
    userlist: {
        name: "routes.usermanager",
        route: "/users/",
        file: "User/List",

        loose: false,
        navbarLoose: true,

        visibleNavbar: true,
        homeIcon: "user",

        category: "user",
        catleader: true
    },
    useredit: {
        name: "routes.useredit",
        route: "/users/edit/user/:id(\\d+)/:tab?/",

        //whole lot of bullshit just to make it that if you have an id, link to the edit page, otherwise link to the list page, and if you link to the user page, put the tab in
        get link(): string {
            return RouteData.selecteduserid !== undefined
                ? `/users/edit/user/${RouteData.selecteduserid}/${
                      RouteData.selectedusertab !== undefined ? `${RouteData.selectedusertab}/` : ""
                  }`
                : AppRoutes.userlist.link ?? AppRoutes.userlist.route;
        },
        file: "User/Edit",

        loose: true,
        navbarLoose: true,

        visibleNavbar: true,
        homeIcon: undefined,

        category: "user"
    },
    usercreate: {
        name: "routes.usercreate",
        route: "/users/create/",

        link: "/users/create/",
        file: "User/Create",

        loose: true,
        navbarLoose: true,

        isAuthorized: adminRight(AdministrationRights.WriteUsers),

        visibleNavbar: true,
        homeIcon: undefined,

        category: "user"
    },
    admin: {
        name: "routes.admin",
        route: "/admin/",
        file: "Administration",

        loose: false,
        navbarLoose: true,

        isAuthorized: adminRight(AdministrationRights.ChangeVersion),

        visibleNavbar: true,
        homeIcon: "tools",

        category: "admin",
        catleader: true
    },
    admin_update: {
        name: "routes.admin.update",
        route: "/admin/update/:all?/",
        file: "Admin/Update",

        link: "/admin/update/",

        loose: true,
        navbarLoose: true,

        isAuthorized: adminRight(AdministrationRights.ChangeVersion),
        visibleNavbar: true,
        homeIcon: undefined,

        category: "admin"
    },
    admin_logs: {
        name: "routes.admin.logs",
        route: "/admin/logs/:name?/",
        link: "/admin/logs/",
        file: "Admin/Logs",

        loose: false,
        navbarLoose: true,

        isAuthorized: adminRight(AdministrationRights.DownloadLogs),
        visibleNavbar: true,
        homeIcon: undefined,

        category: "admin",

        noContainer: true
    },
    passwd: {
        name: "routes.passwd",
        route: "/users/passwd/:id(\\d+)?/",
        link: "/users/passwd/",
        file: "ChangePassword",

        loose: true,
        navbarLoose: true,

        isAuthorized: adminRight(AdministrationRights.EditOwnPassword),

        visibleNavbar: false,
        homeIcon: "key"
    },
    config: {
        name: "routes.config",
        route: "/config/",
        file: "Configuration",

        loose: true,
        navbarLoose: true,

        loginless: true,

        visibleNavbar: false,
        homeIcon: "cogs"
    },
    setup: {
        name: "routes.setup",
        route: "/setup/",
        file: "Setup",

        loose: true,
        navbarLoose: true,

        loginless: true,

        visibleNavbar: false
    },
    oAuth: {
        name: "routes.oauth",
        route: "/oauth/:provider?/",
        file: "Login",

        loose: true,
        navbarLoose: false,

        loginless: true,

        visibleNavbar: false
    },
    info: {
        name: "routes.info",
        route: "/info",
        file: "Info",

        loose: false,
        navbarLoose: false,

        loginless: true,

        visibleNavbar: true,
        homeIcon: "info-circle",

        category: undefined,
        catleader: false
    }
});

export { AppRoutes };

//https://stackoverflow.com/questions/54598322/how-to-make-typescript-infer-the-keys-of-an-object-but-define-type-of-its-value
//Infer the keys but restrict the values to a type
const asElementTypesCategory = <T>(et: { [K in keyof T]: UnpopulatedAppCategory }) => et;

export type UnpopulatedAppCategory = Partial<AppCategory>;

export interface AppCategory {
    name: string; //doesnt really matter, kinda bullshit
    routes: AppRoute[];
    leader: AppRoute;
}

export const UnpopulatedAppCategories = asElementTypesCategory({
    home: {
        name: "home"
    },
    instance: {
        name: "instance"
    },
    user: {
        name: "user"
    },
    admin: {
        name: "admin"
    }
});

// @ts-expect-error This is populated in the constructor after its populated
export const AppCategories: { [K in keyof typeof UnpopulatedAppCategories]: AppCategory } = {};

export const RouteData = {
    selecteduserid: undefined as undefined | number,
    selectedusertab: undefined as undefined | string,

    selectedinstanceid: undefined as undefined | number,
    selectedinstanceedittab: undefined as undefined | string,

    instancelistpage: undefined as undefined | number,
    loglistpage: undefined as undefined | number,
    byondlistpage: undefined as undefined | number,
    userlistpage: undefined as undefined | number,
    jobhistorypage: new Map<number, number>(),

    oautherrors: [] as InternalError<ErrorCode>[]
};
