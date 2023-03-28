module.exports = {
  root: true,
  // Load config from `eslint-config-base`
  extends: ["base"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
