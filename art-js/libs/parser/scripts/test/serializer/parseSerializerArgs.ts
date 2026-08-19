import { getFilterFixtureArg } from '../shared/getFilterFixtureArg';

import type { SerializerCliArgs } from './types';

export function parseSerializerArgs(): SerializerCliArgs {
	return {
		doWriteDebugResult: process.argv.includes('--debug-write-result'),
		filterFixture: getFilterFixtureArg(),
	};
}
