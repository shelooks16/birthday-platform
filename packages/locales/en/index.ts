export default {
  common: () => import('./common').then((r) => r.default()),
  web: () => import('./web').then((r) => r.default()),
  functions: () => import('./functions').then((r) => r.default())
};
