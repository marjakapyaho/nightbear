// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const base = require('../eslintrc.base.js')

// eslint-disable-next-line no-undef
module.exports = {
  ...base,
  root: true,
  parserOptions: {
    ...base.parserOptions,
    project: __dirname + '/tsconfig.json',
  },
  env: { browser: true, es2020: true },
  extends: [...base.extends, 'plugin:react-hooks/recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier', 'react-refresh', 'jest'],
  rules: {
    ...base.rules,
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['../shared'],
        extensions: ['.ts'],
      },
    },
  },
}
