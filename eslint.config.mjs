import eslintConfigPrettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'apps/api/migrations/**'],
  },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'unicorn/no-null': 'error',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/filename-case': [
        'error',
        { cases: { kebabCase: true, camelCase: true, pascalCase: true } },
      ],
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            null: 'Do not use null — use undefined and guard with a truthy check.',
          },
        },
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableString: true,
          allowNullableBoolean: true,
          allowNullableObject: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/dot-notation': [
        'error',
        { allowIndexSignaturePropertyAccess: true },
      ],
    },
  },
  {
    files: ['**/*.mjs', '**/*.js', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['apps/api/src/db/**/*.ts'],
    rules: {
      'unicorn/no-null': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
    },
  },
  eslintConfigPrettier,
);
