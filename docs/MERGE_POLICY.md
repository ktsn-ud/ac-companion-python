# Test Case Merge Policy

Defines how incoming test cases are merged with existing ones on disk. No code is included.

## Goals
- Do not overwrite existing `.in/.out` files
- Append new cases sequentially
- Be idempotent for duplicated inputs/outputs if re-sent

## Directory Structure
`/<contestId>/<taskId>/<testsDir>/` with files `1.in`, `1.out`, `2.in`, `2.out`, ...

## Algorithm (Pseudocode)

```
dir := <workspace>/<contestId>/<taskId>/<testsDir>
ensure dir exists
existing := list files matching /^(\d+)\.(in|out)$/
maxIndex := max(existing indices) or 0

for each incoming test in order:
  idx := maxIndex + 1
  write file `${idx}.in` with incoming.input (UTF-8)
  write file `${idx}.out` with incoming.output (UTF-8)
  maxIndex := idx
```

Notes:
- Do not attempt de-duplication; the policy is append-only
- Normalize newlines to `\n` when writing (optional, recommended)
- Use UTF-8 encoding

## Edge Cases
- Missing `.out`: still write `.in` and write empty `.out` (empty expected)
- Sparse numbering on disk: ignore gaps and continue from `maxIndex`
- Invalid files in directory: ignore files that do not match regex
- Concurrent writes: perform writes synchronously per request

## Examples

1) No existing tests, 3 incoming → write 1..3
2) Existing 1..3, incoming 2 tests → write 4..5
3) Existing 1..3, directory also contains `notes.txt` → ignore non-matching file, write 4..N

