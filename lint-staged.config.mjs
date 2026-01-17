const config = {
	'**/*.{ts?(x),mts}': () => 'tsc -p tsconfig.prod.json --noEmit',
	'*.{js,jsx,mjs,cjs,ts,tsx,mts,json}': [
		'biome check --write',
		...(process.env.SKIP_TESTS === 'true' ? [] : ['vitest related --run']),
	],
	// Excluir pnpm-lock.yaml del lint (es muy grande y causa timeout)
	'*.{yml,yaml}': (filenames) => {
		const filtered = filenames.filter((f) => !f.includes('pnpm-lock.yaml'));
		if (filtered.length === 0) return [];
		return `pnpm run lint:yaml ${filtered.join(' ')}`;
	},
};

export default config;
