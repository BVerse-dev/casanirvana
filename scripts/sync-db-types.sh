#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_FILE="$ROOT_DIR/supabase/database.types.ts"

if [ ! -f "$SRC_FILE" ]; then
  echo "Source types file not found: $SRC_FILE" >&2
  exit 1
fi

cp "$SRC_FILE" "$ROOT_DIR/apps/superadmin/src/lib/database.types.ts"
cp "$SRC_FILE" "$ROOT_DIR/apps/api/src/lib/database.types.ts"
cp "$SRC_FILE" "$ROOT_DIR/apps/resident-mobile/types/database.types.ts"
cp "$SRC_FILE" "$ROOT_DIR/apps/guard-mobile/database.types.ts"

rm -f "$ROOT_DIR/apps/superadmin/src/database.types.ts"
rm -f "$ROOT_DIR/apps/superadmin/src/types/database.types.ts"
rm -f "$ROOT_DIR/apps/resident-mobile/database.types.ts"

echo "Synced database types to apps/superadmin, apps/api, apps/resident-mobile, and apps/guard-mobile."
