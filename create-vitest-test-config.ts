import { loadEnv } from 'vite';
import type { InlineConfig } from 'vitest/node';

export const createVitestTestConfig = (testingType: string): InlineConfig => {
	return {
		root: './',
		globals: true,
		isolate: false,
		passWithNoTests: true,
		include: [`tests/${testingType}/**/*.test.ts`],
		env: loadEnv('test', process.cwd(), ''),
		coverage: {
			provider: 'v8' as const,
			reporter: ['text', 'json', 'html'],
			reportsDirectory: `coverage/${testingType}`,
			include: ['src/**/*.ts'],
			exclude: ['src/main.ts'],
		},
	};
};
