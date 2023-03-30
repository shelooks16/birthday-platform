import { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home'))
  },
  {
    path: '/dash',
    component: lazy(() => import('./pages/Dashboard'))
  }
];
