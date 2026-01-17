#!/bin/bash

echo "Fixing Flutter cache issues..."

# Clean all cached files
flutter clean

# Clear pub cache
rm -rf ~/.pub-cache/hosted/pub.dartlang.org/

# Get dependencies
flutter pub get

# Restart VS Code/Android Studio if running
echo ""
echo "Done! Now:"
echo "1. Close and restart your IDE (VS Code/Android Studio)"
echo "2. Run: flutter run"
