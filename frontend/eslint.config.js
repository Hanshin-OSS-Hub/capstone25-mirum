import js from '@eslint/js';
import { jsdoc } from 'eslint-plugin-jsdoc';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

const sharedExtends = [
  js.configs.recommended,
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
];

const sharedLanguageOptions = {
  ecmaVersion: 2020,
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
};

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: sharedExtends,
    languageOptions: {
      ...sharedLanguageOptions,
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/__tests__/**/*.{js,jsx}'],
    extends: sharedExtends,
    languageOptions: {
      ...sharedLanguageOptions,
      globals: { ...globals.browser, ...globals.jest, global: 'readonly' },
    },
  },
  // JSDoc: 기존 블록이 있으면 일관성·유효성 검사 (모든 함수에 JSdoc 강제는 하지 않음)
  jsdoc({
    config: 'flat/recommended-typescript-flavor',
    files: ['**/*.{js,jsx}'],
    ignores: ['dist/**', '**/*.test.{js,jsx}', '**/__tests__/**', 'src/mocks/**'],
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-file-overview': 'off',
      'jsdoc/require-example': 'off',
      'jsdoc/require-template': 'off',
      'jsdoc/check-examples': 'off',
      'jsdoc/convert-to-jsdoc-comments': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/no-types': 'off',
      'jsdoc/informative-docs': 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/valid-types': 'off',
      'jsdoc/reject-any-type': 'off',
      'jsdoc/reject-function-type': 'off',
      'jsdoc/no-blank-blocks': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/no-bad-blocks': 'warn',
      'jsdoc/check-tag-names': 'warn',
    },
  }),
  // Prettier 연동 설정 (추천 설정 사용)
  prettierRecommended,
]);
