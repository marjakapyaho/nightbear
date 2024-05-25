module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['**/*.queries.ts', '.eslintrc.cjs'],
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
    '@typescript-eslint/restrict-template-expressions': [
      2,
      { allowNumber: true, allowBoolean: true, allowNullish: true },
    ],
    'no-console': ['warn'],
    'no-var': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external']],
      },
    ],
  },
};
