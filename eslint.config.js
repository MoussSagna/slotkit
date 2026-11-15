// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', '!.storybook'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest'], reactRefresh.configs.vite],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Interdit les couleurs codées en dur dans les blocs : tout passe par le thème.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^(rgb|hsl)a?\\(/]',
          message: 'Couleur codée en dur : utilisez une valeur du thème (ex. "primary.main").',
        },
      ],
    },
  },
  {
    // Les tokens sont le seul endroit où les couleurs brutes sont définies.
    files: ['src/theme/tokens.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', '.storybook/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
  ...storybook.configs['flat/recommended'],
  prettier,
);
