#!/usr/bin/env node

import { cpSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');

// Create dist directory if it doesn't exist
if (!existsSync(distDir)) {
	mkdirSync(distDir, { recursive: true });
}

// Copy all files from src to dist
const filesToCopy = ['index.html', 'app.js', 'data.json', 'styles.css'];

for (const file of filesToCopy) {
	const srcPath = join(srcDir, file);
	const distPath = join(distDir, file);
	cpSync(srcPath, distPath);
	console.info(`Copied ${file} to dist/`);
}

console.info('Build complete!');
