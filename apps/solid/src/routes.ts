import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

export enum ROUTE_PATH {
  index = '/',
  birthday = '/dash',
  addBirthday = '/dash/birthday/add',
  profile = '/dash/profile',
  onboarding = '/onboarding'
}

export const routes: RouteDefinition[] = [
  {
    path: ROUTE_PATH.index,
    component: lazy(() => import('./pages/Home'))
  },
  {
    path: ROUTE_PATH.onboarding,
    component: lazy(() => import('./pages/Onboarding'))
  },
  {
    path: ROUTE_PATH.birthday,
    component: lazy(() => import('./pages/dashboard/Layout')),
    children: [
      {
        path: '/',
        component: lazy(() => import('./pages/dashboard/Birthday'))
      },
      {
        path: '/birthday/add',
        component: lazy(() => import('./pages/dashboard/AddBirthday'))
      },
      {
        path: '/profile',
        component: lazy(() => import('./pages/dashboard/Profile'))
      }
    ]
  },
  {
    path: '/*all',
    component: lazy(() => import('./pages/404'))
  }
];
