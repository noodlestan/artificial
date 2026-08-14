# Checkout Name Resolution — Investigation Findings

## Current Behavior

- `getCheckoutByName` does exact case-insensitive match on `checkout.record.name`
- No prefix stripping
- No slug conversion
- No location fallback

## Identified Gaps

1. User input `"Repository: No Comply"` doesn't match record name `"No Comply"`
2. User input `"no-comply"` (slug) doesn't match record name `"No Comply"`
3. No fallback to location matching

## Proposed Resolution Logic

1. Exact match (case-insensitive)
2. Strip `"Repository:"` prefix, then exact match
3. Convert to slug format, then exact match
4. Fallback to location match

## Test Cases

- `repo "No Comply"` → matches checkout with `record.name = "No Comply"`
- `repo "Repository: No Comply"` → matches checkout with `record.name = "No Comply"`
- `repo "no-comply"` → matches checkout with `record.name = "No Comply"` or `location = "no-comply"`
- `repo "Unknown"` → warns `"unknown checkout: Unknown"`
