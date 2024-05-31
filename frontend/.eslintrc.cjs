module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: __dirname + '/tsconfig.json',
  },
  env: {
    es2021: true,
    browser: true
  },
  plugins: ['prettier', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'prettier/prettier': ['error'],
    eqeqeq: ['error'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
      },
    ],
    'no-console': ['warn'],
    'no-var': 'error',
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off'
  },
  root: true,
  ignorePatterns: ['.eslintrc.cjs'],
  settings: {
    'react': {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        paths: ['../shared'],
        extensions: ['.ts'],
      },
    },
  },
}
