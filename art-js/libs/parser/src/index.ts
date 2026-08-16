import type { Point } from '@art-js/artificial-primitives';

/** Origin point — smoke value proving the parser→primitives dependency resolves. */
const origin: Point = { line: 1, column: 1, offset: 0 };

console.info(origin);
