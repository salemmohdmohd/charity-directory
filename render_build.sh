#!/usr/bin/env bash
# Small build helper for Render.com
# - Only builds frontend assets (Node) so the Python service build remains fast and deterministic.
# - Do NOT run DB migrations or app runtime commands here; Render executes the build phase before services start
#   and before the database is provisioned for some setups. Run migrations in a separate "job" or at service start.

set -o errexit
set -o pipefail

# Use npm ci for reproducible installs if package-lock.json exists; otherwise fall back to npm install
if [ -f package-lock.json ]; then
  echo "Using npm ci"
  npm ci --prefer-offline --no-audit --no-fund
else
  echo "package-lock.json not found, running npm install"
  npm install --no-audit --no-fund
fi

# Build the frontend
echo "Building frontend with npm run build"
npm run build

echo "Frontend build complete"
