#!/usr/bin/env bash
# Helper to run Flask DB migrations on Render or any production host where
# DATABASE_URL and other env vars are configured.

set -euo pipefail

if [ -z "${FLASK_APP:-}" ]; then
  export FLASK_APP=src/app.py
fi

echo "Running Flask DB migrations (flask db upgrade)..."
flask db upgrade
echo "Migrations complete."
