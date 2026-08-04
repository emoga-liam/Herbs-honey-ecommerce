#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="${ROOT_DIR}/ffg-foods-hostinger-source.zip"

cd "${ROOT_DIR}"
rm -f "${OUTPUT}"

zip -qr "${OUTPUT}" . \
  -x ".git/*" \
  -x ".local/*" \
  -x ".agents/*" \
  -x ".cache/*" \
  -x ".replit" \
  -x ".replitignore" \
  -x ".env" \
  -x "*/.env" \
  -x ".env.local" \
  -x "*/.env.local" \
  -x ".env.production" \
  -x "*/.env.production" \
  -x "node_modules/*" \
  -x "*/node_modules/*" \
  -x "*/dist/*" \
  -x "*/.replit-artifact/*" \
  -x "*.tsbuildinfo" \
  -x "*.log" \
  -x "ffg-foods-hostinger-source.zip"

echo "Created ${OUTPUT}"