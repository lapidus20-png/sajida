@echo off
echo ==================================================
echo    ARTISAN BF - RUN ON PHYSICAL DEVICE
echo ==================================================
echo.

REM Check if we're in the right directory
if not exist "pubspec.yaml" (
    echo [ERROR] Not in Flutter project directory!
    echo.
    echo Please navigate to the flutter_app folder first:
    echo   cd path\to\your\project\flutter_app
    echo.
    pause
    exit /b 1
)

echo [OK] Found Flutter project
echo.

REM Step 1: Clean build
echo Step 1: Cleaning previous builds...
flutter clean
echo.

REM Step 2: Get dependencies
echo Step 2: Getting dependencies...
flutter pub get
if errorlevel 1 (
    echo [ERROR] Failed to get dependencies
    pause
    exit /b 1
)
echo.

REM Step 3: Check for connected devices
echo Step 3: Checking for connected devices...
flutter devices
echo.

REM Step 4: Check if device is connected
adb devices | find "device" >nul
if errorlevel 1 (
    echo [ERROR] No physical devices found!
    echo.
    echo Please:
    echo   1. Enable USB Debugging on your phone
    echo   2. Connect your phone via USB
    echo   3. Accept the USB debugging prompt
    echo   4. Run this script again
    echo.
    echo To enable USB Debugging:
    echo   Settings -^> About Phone -^> Tap 'Build Number' 7 times
    echo   Settings -^> Developer Options -^> Enable 'USB Debugging'
    echo.
    pause
    exit /b 1
)

echo [OK] Device connected
echo.

REM Step 4: Run the app
echo Step 4: Building and running app on device...
echo This will take 3-5 minutes on first run...
echo.

flutter run

echo.
echo ==================================================
echo App should now be running on your device!
echo.
echo Hot Reload Commands:
echo   r - Reload (quick)
echo   R - Restart (full)
echo   q - Quit
echo ==================================================
pause
