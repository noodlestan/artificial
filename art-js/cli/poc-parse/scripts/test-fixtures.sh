#!/bin/bash
# Test script for poc-parse fixtures
# Auto-discovers all .md and .art files in fixtures/ and runs parser on each

set -e

FIXTURES_DIR="fixtures"
EXIT_CODE=0

# Find all .md and .art files in fixtures directory
FIXTURES=$(find "$FIXTURES_DIR" -maxdepth 1 -type f \( -name "*.md" -o -name "*.art" \) | sort)

if [ -z "$FIXTURES" ]; then
  echo "No fixture files found in $FIXTURES_DIR"
  exit 1
fi

for fixture in $FIXTURES; do
  filename=$(basename "$fixture")
  echo "Testing $filename..."
  
  # Run once
  if npx tsx src/parse/parse.ts "$fixture" > "/tmp/${filename}.json" 2>/dev/null; then
    echo "  PASS"
  else
    echo "  FAIL"
    EXIT_CODE=1
    continue
  fi
  
  # Update the committed fixture
  base="${filename%.*}"
  cp "/tmp/${filename}.json" "$FIXTURES_DIR/${base}.art.json"
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "All fixtures passed!"
else
  echo "Some fixtures failed!"
fi

exit $EXIT_CODE
