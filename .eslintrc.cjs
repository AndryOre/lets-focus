module.exports = {
	extends: ['plugin:astro/recommended', 'plugin:astro/jsx-a11y-strict'],
	overrides: [
		{
			files: ['*.astro'],
			parser: 'astro-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro'],
			},
			rules: {},
		},
		{
			files: ['*.ts', '*.tsx'],
			parser: '@typescript-eslint/parser',
			plugins: ['@typescript-eslint'],
			extends: ['plugin:@typescript-eslint/recommended'],
			parserOptions: {
				sourceType: 'module',
			},
			rules: {},
		},
	],
};
