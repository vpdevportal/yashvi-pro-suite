#!/usr/bin/env bash

# Deploy script for Yashvi Pro Suite
# Builds the macOS app and copies it to Applications folder

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
APPLICATIONS_PATH="/Applications/${APP_NAME}.app"

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Step 1: Build the app
echo -e "${YELLOW}📦 Building macOS app...${NC}"
npm run build:electron

# Check if build was successful
if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}❌ Build failed: ${APP_PATH} not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 2: Remove existing app from Applications if it exists
if [ -d "$APPLICATIONS_PATH" ]; then
    echo -e "${YELLOW}🗑️  Removing existing app from Applications...${NC}"
    rm -rf "$APPLICATIONS_PATH"
fi

# Step 3: Copy app to Applications folder
echo -e "${YELLOW}📋 Copying app to Applications folder...${NC}"
cp -R "$APP_PATH" "$APPLICATIONS_PATH"

# Step 4: Verify the copy
if [ -d "$APPLICATIONS_PATH" ]; then
    echo -e "${GREEN}✅ Successfully deployed to Applications folder!${NC}"
    echo -e "${GREEN}📍 Location: ${APPLICATIONS_PATH}${NC}"
else
    echo -e "${RED}❌ Failed to copy app to Applications folder${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"

