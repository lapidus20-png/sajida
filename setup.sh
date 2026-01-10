#!/bin/bash

echo "===================================="
echo "Artisan Marketplace - Setup Script"
echo "===================================="
echo ""

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please download and install Node.js from:"
    echo "https://nodejs.org"
    echo ""
    exit 1
fi

echo "Node.js found!"
node --version
echo ""

echo "Installing dependencies..."
echo "This may take 1-2 minutes..."
echo ""
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "===================================="
    echo "Setup Complete!"
    echo "===================================="
    echo ""
    echo "To start the app, run:"
    echo "  npm run dev"
    echo ""
    echo "Or run: ./start.sh"
    echo ""
else
    echo ""
    echo "ERROR: Installation failed!"
    echo "Please check your internet connection and try again."
    exit 1
fi
