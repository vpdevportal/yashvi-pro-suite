#!/usr/bin/env bash

# Deploy script for Yashvi Pro Suite
# Builds the macOS app and keeps it in the dist folder

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

APP_NAME="Yashvi Pro Suite"
APP_PATH="dist/mac-arm64/${APP_NAME}.app"

echo -e "${GREEN}🚀 Starting build...${NC}"

# Build the app
echo -e "${YELLOW}📦 Building macOS app...${NC}"
npm run build:electron

# Check if build was successful
if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}❌ Build failed: ${APP_PATH} not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo -e "${GREEN}📍 App location: ${SCRIPT_DIR}/${APP_PATH}${NC}"
echo -e "${GREEN}🎉 Build complete!${NC}"

