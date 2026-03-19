import { writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const swcrc = {
	$schema: 'https://swc.rs/schema.json',
	sourceMaps: true,
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
		target: 'es2022',
		keepClassNames: true,
		baseUrl: projectRoot,
		paths: {
			'@/src/*': ['src/*'],
			'@/app/*': ['src/app/*'],
			'@/contexts/*': ['src/contexts/*'],
			'@/shared/*': ['src/shared/*'],
			'@/tests/*': ['tests/*'],
		},
	},
	module: {
		type: 'es6',
		strict: true,
		strictMode: true,
		noInterop: false,
	},
	minify: false,
};

writeFileSync(
	resolve(projectRoot, '.swcrc'),
	JSON.stringify(swcrc, null, '\t') + '\n',
);

console.log('✅ .swcrc generated with absolute baseUrl:', swcrc.jsc.baseUrl);
