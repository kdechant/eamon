module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    "cypress/globals": true
  },
  plugins: [
    '@typescript-eslint',
    'cypress'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-prototype-builtins': 'off',
    'no-case-declarations': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  }
};
