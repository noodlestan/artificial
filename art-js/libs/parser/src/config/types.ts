import type { ConstructParserFactory } from '@art-js/artificial-constructs';

export interface ParserConfig {
	defaultConstruct: ConstructParserFactory;
	constructs: ConstructParserFactory[];
}
