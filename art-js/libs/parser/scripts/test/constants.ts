import * as path from 'node:path';

const THIS_DIR = path.dirname(new URL(import.meta.url).pathname);

export const FIXTURES_DIR = path.resolve(THIS_DIR, '..', '..', 'test', 'fixtures');
