#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_FILE="$ROOT_DIR/supabase/database.types.ts"

if [ ! -f "$SRC_FILE" ]; then
  echo "Source types file not found: $SRC_FILE" >&2
  exit 1
fi

cp "$SRC_FILE" "$ROOT_DIR/superadmin/src/lib/database.types.ts"
cp "$SRC_FILE" "$ROOT_DIR/backend/src/lib/database.types.ts"
cp "$SRC_FILE" "$ROOT_DIR/user/types/database.types.ts"
cp "$SRC_FILE" "$ROOT_DIR/Guard/database.types.ts"

rm -f "$ROOT_DIR/superadmin/src/database.types.ts"
rm -f "$ROOT_DIR/superadmin/src/types/database.types.ts"
rm -f "$ROOT_DIR/user/database.types.ts"

echo "Synced database types to superadmin, backend, user, and Guard."
