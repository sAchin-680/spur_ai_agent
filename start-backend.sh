#!/bin/bash

# Set Node 20 in PATH
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

echo "Starting backend server with Node $(node -v)..."
echo ""

cd "$(dirname "$0")/backend"

# Run the dev server
npm run dev
