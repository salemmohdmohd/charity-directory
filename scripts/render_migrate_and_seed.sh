#!/usr/bin/env bash
set -euo pipefail

# Safe migrate + seed script for Render one-off shell
# Usage: ./render_migrate_and_seed.sh
# This script expects DATABASE_URL to be set in the environment.

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL must be set"
  exit 2
fi

echo "DATABASE_URL detected"

# Psycopg2/SQLAlchemy SSL: for many managed Postgres providers, require SSLmode=require
# If the URL already contains sslmode, respect it; otherwise append sslmode=require
if [[ "${DATABASE_URL}" != *"sslmode="* ]]; then
  export DATABASE_URL="${DATABASE_URL}?sslmode=require"
  echo "Appended sslmode=require to DATABASE_URL"
fi

# Ensure Flask env vars for migrations
export FLASK_APP=src/app.py
export FLASK_ENV=production

echo "Running database migrations (flask db upgrade)..."
python -m flask db upgrade

# Seed data if seed script exists
if [ -f "scripts/seed_meaningful.py" ]; then
  echo "Running seed script scripts/seed_meaningful.py"
  python scripts/seed_meaningful.py
else
  echo "No seed script found at scripts/seed_meaningful.py; skipping seeds"
fi

echo "Migrations and seeds complete"
