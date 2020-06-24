import { IconProp } from '@fortawesome/fontawesome-svg-core';
import ServerClient from '../clients/ServerClient';
import UserClient from '../clients/UserClient';
import { StatusCode } from '../models/InternalComms/InternalStatus';
import { Components } from '../clients/_generated';
import { AdministrationRights } from './enums';

export type NormalRoute = {
    route: string;
    name: string;
    icon: IconProp;
    exact?: boolean;
    hidden?: false;
    isAuthorized?: () => Promise<boolean>;
    display: number;
};

export type HiddenRoute = {
    route: string;
    name: string;
    icon: undefined;
    exact?: boolean;
    hidden: true;
    isAuthorized?: () => Promise<boolean>;
};

export type AppRoute = NormalRoute | HiddenRoute;

export const AppRoutes: {
    [id: string]: AppRoute;
} = {
    home: {
        route: '/',
        name: 'routes.home',
        exact: true,
        icon: 'home',
        isAuthorized: async () => true,
        display: 0
    },
    instances: {
        route: '/Instance/',
        name: 'routes.instances',
        icon: 'hdd',
        isAuthorized: async () => true,
        display: 1
    },
    userManager: {
        route: '/Users/',
        name: 'routes.user_manager',
        icon: 'user',
        isAuthorized: async () => true,
        display: 2
    },
    admin: {
        route: '/Administration/',
        name: 'routes.admin',
        icon: 'tools',
        isAuthorized: async () => {
            if (!ServerClient.isTokenValid()) return false;
            const response = await UserClient.getCurrentUser();

            if (response.code == StatusCode.OK) {
                return !!(
                    response.payload!.administrationRights &
                    (AdministrationRights.ChangeVersion | AdministrationRights.RestartHost)
                );
            }
            return false;
        },
        display: 3
    }
};
