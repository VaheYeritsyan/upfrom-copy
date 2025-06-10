module.exports = {
  extends: ['next/core-web-vitals', 'plugin:react-hooks/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@next/next/no-html-link-for-pages': ['error', 'admin_portal/src/pages'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'react-hooks/exhaustive-deps': 'off',
  },
};
