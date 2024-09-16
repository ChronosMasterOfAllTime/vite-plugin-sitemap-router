import js from '@eslint/js'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import globals from 'globals'

const config = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.{ts,tsx}']
  },
  {
    ignores: [
      'node_modules/*',
      'dist/*',
      '.gitignore',
      '.git/*',
      'eslint.config.js'
    ]
  },
  {
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
      },
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
)

export default config
