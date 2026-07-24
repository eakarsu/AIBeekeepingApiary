#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
set -a; source "$PROJECT_DIR/.env"; set +a
node "$PROJECT_DIR/backend/scripts/migrate.js"
