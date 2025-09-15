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

# Install Python dependencies so runtime tools like gunicorn are available
# This is safe to run in Render's build phase; it will install packages into the
# environment used for the later start command. If your service uses Poetry
# or Pipenv on Render, adapt accordingly (see DEPLOY_TO_RENDER.md).
if [ -f requirements.txt ]; then
  echo "Installing Python dependencies from requirements.txt"
  pip install --upgrade pip setuptools wheel
  pip install -r requirements.txt
else
  echo "No requirements.txt found, skipping pip install. If you use Poetry, ensure Render installs dependencies in build settings."
fi
