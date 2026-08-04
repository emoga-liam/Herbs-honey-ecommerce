#!/usr/bin/env bash
set -euo pipefail

# Some Hostinger build environments preserve the executable bit incorrectly
# while pnpm is unpacking esbuild. Installing without lifecycle scripts lets us
# repair the bit before esbuild's official installer validates its native binary.
pnpm install --frozen-lockfile --ignore-scripts

find node_modules/.pnpm \
  -type f \
  -path '*/esbuild*/node_modules/esbuild/bin/esbuild' \
  -exec chmod u+x {} +

while IFS= read -r -d '' installer; do
  node "${installer}"
done < <(
  find node_modules/.pnpm \
    -type f \
    -path '*/esbuild@*/node_modules/esbuild/install.js' \
    -print0
)