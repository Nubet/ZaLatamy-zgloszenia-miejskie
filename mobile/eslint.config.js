const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expo,
  { ignores: ['dist/**', '.expo/**'] },
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useEffect'],
              message: 'Prefer events, derived state or a subscription.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react-native',
            'expo*',
            '@/application/*',
            '@/infrastructure/*',
            '@/features/*',
            '@/shared/*',
          ],
        },
      ],
    },
  },
]);
