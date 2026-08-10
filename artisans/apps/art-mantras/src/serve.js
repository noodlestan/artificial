// Art Mantras — Serving layer: static http server over src/ (node:http + node:fs only)

import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';

const PORT = 8000;
const SRC_DIR = 'src';

const CONTENT_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
};

function resolveFile(url) {
	try {
		const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
		const segments = pathname.split('/').filter(s => s && s !== '.' && s !== '..');
		const name = segments.length === 0 ? 'index.html' : segments.join('/');
		return `${SRC_DIR}/${name}`;
	} catch {
		return null;
	}
}

function contentTypeFor(file) {
	const dot = file.lastIndexOf('.');
	if (dot === -1) return 'application/octet-stream';
	return CONTENT_TYPES[file.slice(dot)] ?? 'application/octet-stream';
}

const handler = (req, res) => {
	const file = resolveFile(req.url);
	if (!file || !existsSync(file)) {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('404 Not Found');
		return;
	}
	res.writeHead(200, { 'Content-Type': contentTypeFor(file) });
	res.end(readFileSync(file));
};

const server = createServer(handler);

server.listen(PORT, () => {
	console.info(`art-mantras serving http://localhost:${PORT}`);
});
