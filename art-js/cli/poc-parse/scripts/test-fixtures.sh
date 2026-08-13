#!/bin/bash
# Test script for poc-parse fixtures
# Runs each fixture 3 times and verifies identical output

set -e

FIXTURES=("markdown.md" "section-block.md" "field-block.md" "parser.art" "configuration.art")
EXIT_CODE=0

for fixture in "${FIXTURES[@]}"; do
  echo "Testing $fixture..."
  
  # Run 3 times and compare
  npx tsx src/parse/parse.ts "fixtures/$fixture" > "/tmp/${fixture}.run1.json" 2>/dev/null
  npx tsx src/parse/parse.ts "fixtures/$fixture" > "/tmp/${fixture}.run2.json" 2>/dev/null
  npx tsx src/parse/parse.ts "fixtures/$fixture" > "/tmp/${fixture}.run3.json" 2>/dev/null
  
  # Compare outputs
  if ! diff -q "/tmp/${fixture}.run1.json" "/tmp/${fixture}.run2.json" > /dev/null 2>&1; then
    echo "  FAIL: Run 1 vs Run 2 differ"
    EXIT_CODE=1
  elif ! diff -q "/tmp/${fixture}.run1.json" "/tmp/${fixture}.run3.json" > /dev/null 2>&1; then
    echo "  FAIL: Run 1 vs Run 3 differ"
    EXIT_CODE=1
  else
    echo "  PASS: All 3 runs identical"
  fi
  
  # Also update the committed fixture
  base="${fixture%.*}"
  cp "/tmp/${fixture}.run1.json" "fixtures/${base}.art.json"
done

if [ $EXIT_CODE -eq 0 ]; then
  echo "All fixtures passed!"
else
  echo "Some fixtures failed!"
fi

exit $EXIT_CODE
