import { getFilterFixtureArg } from '../shared/getFilterFixtureArg';

import type { ParserCliArgs } from './types';

export function parseParserArgs(): ParserCliArgs {
	return {
		doWrite: process.argv.includes('--write'),
		filterFixture: getFilterFixtureArg(),
	};
}
