#!/bin/bash

echo "Starting frontend server..."
echo ""

cd "$(dirname "$0")/frontend"

# Run the dev server
npm run dev
