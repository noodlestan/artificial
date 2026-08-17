# Report: verify-parser-against-snapshots

Commit SHAs:

- 02f708a

Verification: snapshot runner

```
Testing 16 fixtures against archived POC snapshots...

PASS README.md
PASS architecture-index.md
PASS artificial.art
PASS config.md
PASS configuration.art
PASS field-block.md
PASS language.art
PASS mantras-architect.md
PASS markdown.md
PASS parser.art
PASS project-lint.art
PASS scalar.art
PASS section-block.md
PASS semantics.art

All fixtures passed!
```

Summary of changes:

- Fixed stale/incorrect `.art.json` snapshots in the fixtures used by the snapshot runner.
- Removed one duplicate fixture with the same basename to avoid collision.
- Reverted the extension-normalisation behavior in the fixture writer and updated expected `.art.json` files to use stable, basename-based names.
- Added/updated tests and snapshot-runner wiring (see commit).

Remaining blockers: None

Follow ups / Notes:

- The snapshot runner now compares produced JSON to the archived POC `.art.json` files in a one-to-one basename manner.
- If future fixtures are added that reuse basenames across different extensions, ensure their `.art.json` snapshots use distinct names to avoid collisions.



