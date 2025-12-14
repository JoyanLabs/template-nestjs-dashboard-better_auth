const config = {
	'**/*.{ts?(x),mts}': () => 'tsc -p tsconfig.prod.json --noEmit',
	'*.{js,jsx,mjs,cjs,ts,tsx,mts,md,json}': [
		'biome check --write',
		...(process.env.SKIP_TESTS === 'true' ? [] : ['vitest related --run']),
	],
	'*.{yml,yaml}': 'pnpm run lint:yaml',
};

export default config;
