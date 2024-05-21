module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: __dirname + '/tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: [
    '**/*.queries.ts',
    '.eslintrc.cjs',
  ],
  rules: {
    'prettier/prettier': ['error'],
    eqeqeq: ['error', 'allow-null'],
    'consistent-return': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-console': ['warn'],
    'no-var': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external']],
      },
    ],
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
  },
  overrides: [
    {
      files: ['test/**/*.ts', '*.test.ts'],
    },
  ],
  root: true,
  env: { browser: true, es2020: true },
  plugins: ['prettier', 'react-refresh'],
  settings: {
    'import/resolver': {
      node: {
        paths: ['../shared'],
        extensions: ['.ts'],
      },
    },
  },
}
