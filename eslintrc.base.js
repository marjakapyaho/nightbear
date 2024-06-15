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
  ignorePatterns: [
    '**/*.queries.ts',
    '.eslintrc.cjs',
    '**/jest.config.js',
    '**/file-storage-client/**',
  ],
  rules: {
    'prettier/prettier': ['error'],
    eqeqeq: ['error', 'allow-null'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      2,
      { allowNumber: true, allowBoolean: true, allowNullish: true },
    ],
    'no-console': 'off',
    'no-var': 'error',
    'import/order': 'off',
  },
  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
  ],
}
