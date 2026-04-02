#!/usr/bin/env bash
set -e

# Build script for static export (Linux/macOS)

echo "Installing dependencies..."
npm install

echo "Building static export..."
npm run build

echo "Build complete. Upload the contents of the 'out/' folder to your web host."
