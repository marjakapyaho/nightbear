const base = require('../eslintrc.base.js')

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: __dirname + '/tsconfig.json',
  },
  plugins: ['prettier']
}
