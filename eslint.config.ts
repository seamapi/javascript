import { globalIgnores } from 'eslint/config'
import love from 'eslint-config-love'
import prettier from 'eslint-config-prettier/flat'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'

const files = ['**/*.{ts,tsx}']

export default [
  globalIgnores(['**/*.d.ts']),
  {
    ...love,
    files,
    rules: {
      ...love.rules,
      'import/extensions': ['error', 'ignorePackages'],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/no-relative-parent-imports': 'error',
    },
  },
  {
    files,
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files,
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^@?\\w'],
            ['@seamapi/makenew-tsmodule'],
            ['^lib/'],
            ['^'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  { ...prettier, files },
]
