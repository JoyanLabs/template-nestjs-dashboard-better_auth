import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

import { createVitestTestConfig } from './create-vitest-test-config.js';

export default defineConfig({
	test: {
		...createVitestTestConfig('unit'),
	},
	plugins: [
		swc.vite({
			jsc: {
				parser: {
					syntax: 'typescript',
					decorators: true,
					dynamicImport: true,
				},
				transform: {
					legacyDecorator: true,
					decoratorMetadata: true,
				},
				target: 'es2018',
			},
		}),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@/app': resolve(__dirname, './src/app'),
			'@/contexts': resolve(__dirname, './src/contexts'),
			'@/shared': resolve(__dirname, './src/contexts/shared'),
			'@/tests': resolve(__dirname, './tests'),
		},
	},
});
