#!/bin/bash

echo "=================================================="
echo "   ARTISAN BF - RUN ON PHYSICAL DEVICE"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "pubspec.yaml" ]; then
    echo -e "${RED}ERROR: Not in Flutter project directory!${NC}"
    echo ""
    echo "Please navigate to the flutter_app folder first:"
    echo "  cd path/to/your/project/flutter_app"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Found Flutter project${NC}"
echo ""

# Step 1: Clean build
echo "Step 1: Cleaning previous builds..."
flutter clean
echo ""

# Step 2: Get dependencies
echo "Step 2: Getting dependencies..."
flutter pub get
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to get dependencies${NC}"
    exit 1
fi
echo ""

# Step 3: Check for connected devices
echo "Step 3: Checking for connected devices..."
flutter devices
echo ""

DEVICE_COUNT=$(flutter devices | grep -c "mobile")

if [ $DEVICE_COUNT -eq 0 ]; then
    echo -e "${RED}ERROR: No physical devices found!${NC}"
    echo ""
    echo "Please:"
    echo "  1. Enable USB Debugging on your phone"
    echo "  2. Connect your phone via USB"
    echo "  3. Accept the USB debugging prompt"
    echo "  4. Run this script again"
    echo ""
    echo "To enable USB Debugging:"
    echo "  Settings → About Phone → Tap 'Build Number' 7 times"
    echo "  Settings → Developer Options → Enable 'USB Debugging'"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Found $DEVICE_COUNT device(s)${NC}"
echo ""

# Step 4: Run the app
echo "Step 4: Building and running app on device..."
echo "This will take 3-5 minutes on first run..."
echo ""

flutter run

echo ""
echo "=================================================="
echo "App should now be running on your device!"
echo ""
echo "Hot Reload Commands:"
echo "  r - Reload (quick)"
echo "  R - Restart (full)"
echo "  q - Quit"
echo "=================================================="
