module.exports = {
  extends: [
    'eslint:recommended',
    'turbo',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['build/**/*', '.eslintrc.js', 'eslint-config-base'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
