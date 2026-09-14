#!/usr/bin/env bash
set -e

# Build script for static export (Linux/macOS)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/next.config.mjs"

read -rp "Enter basePath (e.g. staging-culture), or press Enter for root: " BASE_PATH

if [ -n "$BASE_PATH" ]; then
    echo "Setting basePath to /$BASE_PATH"
    # Remove existing basePath line if present, then add new one
    sed -i.bak '/basePath:/d' "$CONFIG_FILE"
    sed -i.bak 's|output: "export",|output: "export",\n  basePath: "/'"$BASE_PATH"'",|' "$CONFIG_FILE"
    rm -f "$CONFIG_FILE.bak"
else
    echo "No basePath set (root deployment)"
    # Remove existing basePath line if present
    sed -i.bak '/basePath:/d' "$CONFIG_FILE"
    rm -f "$CONFIG_FILE.bak"
fi

echo "Installing dependencies..."
npm install

echo "Building static export..."
npm run build

if [ -n "$BASE_PATH" ]; then
    echo "Build complete. Upload the contents of 'out/' to your web host under /$BASE_PATH/"
else
    echo "Build complete. Upload the contents of 'out/' to your web host root."
fi
