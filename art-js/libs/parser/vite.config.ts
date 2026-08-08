import { readFileSync } from 'fs';
import { resolve } from 'path';

import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import SolidSVG from 'vite-plugin-solid-svg';
import topLevelAwait from 'vite-plugin-top-level-await';

const NAME = JSON.parse(readFileSync('package.json', 'utf8')).name;

export default defineConfig({
	plugins: [solidPlugin(), SolidSVG(), topLevelAwait()],
	resolve: {
		alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
	},
	server: {
		port: 3000,
	},
	build: {
		outDir: 'dist/esm/',
		emptyOutDir: true,
		target: 'esnext',
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: NAME,
			fileName: 'index',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['solid-js'],
		},
	},
});
