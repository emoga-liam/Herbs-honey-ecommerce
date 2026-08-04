#!/usr/bin/env bash
set -euo pipefail

found=0
allow_missing="${1:-}"

# Hostinger can remove executable bits while extracting pnpm's store and
# symlinked packages. Check both the hoisted layout and the virtual-store
# layout so this works before and after pnpm installation.
while IFS= read -r -d '' binary; do
  chmod +x "${binary}"
  found=1
  echo "Repaired executable permission: ${binary}"
done < <(
  find -L node_modules \
    -type f \
    -path '*/esbuild/bin/esbuild' \
    -print0 2>/dev/null
)

if [[ "${found}" -eq 0 && "${allow_missing}" != "--allow-missing" ]]; then
  echo "esbuild binary was not found under node_modules." >&2
  exit 1
fi