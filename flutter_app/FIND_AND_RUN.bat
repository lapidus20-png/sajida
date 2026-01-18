@echo off
echo ============================================
echo    ARTISAN BF - FLUTTER APP LAUNCHER
echo ============================================
echo.
echo This script will help you run the Flutter app!
echo.

REM Check if we're in the right directory
if exist "pubspec.yaml" (
    echo [OK] Found Flutter project!
    echo.
) else (
    echo [ERROR] Not in Flutter project directory!
    echo.
    echo Please navigate to the flutter_app folder first:
    echo   cd path\to\your\project\flutter_app
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo Step 1: Getting dependencies...
echo.
flutter pub get
echo.

echo Step 2: Checking for connected devices...
echo.
flutter devices
echo.

echo Step 3: Running the app...
echo.
echo The app will launch on your connected device/emulator.
echo.
flutter run

pause
