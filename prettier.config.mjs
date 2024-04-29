const config = {
  arrowParens: 'always',
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  endOfLine: 'lf',
  plugins: [
    'prettier-plugin-astro',
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@components/(.*)$',
    '^@content/(.*)$',
    '^@layouts/(.*)$',
    '^@pages/(.*)$',
    '^@data/(.*)$',
    '^@styles/(.*)$',
    '^@/(.*)$',
    '^.[./].*',
    '',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  overrides: [
    {
      files: ['*.json', '*.md', '*.toml', '*.yml'],
      options: {
        useTabs: false,
      },
    },
    {
      files: ['*.astro'],
      options: {
        parser: 'astro',
      },
    },
  ],
};

export default config;
