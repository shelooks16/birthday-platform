module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true
  },
  extends: ['base', 'plugin:solid/typescript'],
  plugins: ['solid'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {}
};
