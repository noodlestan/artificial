# Artificials Poc Parse

> POC spike of the artificials parser: a self-contained, CLI-executable package.

Runnable, self-contained CLI package for the artificials parser POC, internally partitioned along the pipeline boundaries (parse/extract/transform/render) so it mirrors the future art-js modules. POC step 1 scaffolds the runnable CLI; parsing logic, schema types, and the micromark substrate are deliberately deferred.

This package is part of the [@artificials](../../README.md) toolkit.

## Development

Make sure you read the [namespace README](../../README.md) first.

### Build

This CLI is packaged for use in Node.js environments.

### Scripts

- **$** `npm run dev` – Run the POC CLI entry (`node --experimental-strip-types src/index.ts`)
- **$** `npm run lint` – Check formatting, lint, and type check
- **$** `npm run lint:fix` – Fix formatting and lint issues
- **$** `npm run build:clean` – Remove build artifacts
- **$** `npm run test` – Run tests

## MIT License

Copyright (c) 2026 Noodlestan https://noodlestan.org/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
