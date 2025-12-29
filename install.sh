#!/bin/bash

# Set Node 20 in PATH
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

echo "=================================="
echo "Installing Frontend Dependencies"
echo "=================================="
cd frontend && npm install
cd ..

echo ""
echo "=================================="
echo "✅ Installation Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to backend/.env"
echo "   Open backend/.env and replace 'your_openai_api_key_here' with your actual key"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   export PATH=\"/opt/homebrew/opt/node@20/bin:\$PATH\""
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo "=================================="
