const base = require('../eslintrc.base.js')

module.exports = {
  ...base,
  root: true,
  parserOptions: {
    ...base.parserOptions,
    project: __dirname + '/tsconfig.json',
  },
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    ...base.extends,
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    'prettier',
    'react-refresh'
  ]
}
