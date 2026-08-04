#!/usr/bin/env bash
set -euo pipefail

# Some Hostinger build environments preserve the executable bit incorrectly
# while pnpm is unpacking esbuild. Installing without lifecycle scripts lets us
# repair the bit before esbuild's official installer validates its native binary.
pnpm install --frozen-lockfile --ignore-scripts

bash ./scripts/repair-native-binaries.sh

while IFS= read -r -d '' installer; do
  node "${installer}"
done < <(
  find -L node_modules \
    -type f \
    -path '*/esbuild/install.js' \
    -print0 2>/dev/null
)