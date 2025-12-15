#!/usr/bin/env bash

# Start the app in development mode (React dev server + Electron)
# from the project root, without opening a browser tab (macOS-friendly).

set -euo pipefail

# Go to the directory where this script is located (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Prevent create-react-app from opening the browser, then start dev (React + Electron)
export BROWSER=none

npm run dev

