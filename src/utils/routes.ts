import { IconProp } from '@fortawesome/fontawesome-svg-core';

type AppRoute =
    | {
          route: string;
          name: string;
          icon: IconProp;
          exact?: boolean;
          hidden?: false;
      }
    | {
          route: string;
          name: string;
          exact?: boolean;
          icon: undefined;
          hidden: true;
      };

export const AppRoutes: {
    [id: string]: AppRoute;
} = {
    home: {
        route: '/',
        name: 'routes.home',
        exact: true,
        icon: 'home'
    },
    instances: {
        route: '/Instance/',
        name: 'routes.instances',
        icon: 'hdd'
    },
    userManager: {
        route: '/Users/',
        name: 'routes.user_manager',
        icon: 'user'
    },
    instances2: {
        route: '/Instance/',
        name: 'routes.instances',
        icon: 'hdd'
    },
    userManager2: {
        route: '/Users/',
        name: 'routes.user_manager',
        icon: 'user'
    },
    instances4: {
        route: '/Instance/',
        name: 'routes.instances',
        icon: 'hdd'
    },
    userManager4: {
        route: '/Users/',
        name: 'routes.user_manager',
        icon: 'user'
    }
};
