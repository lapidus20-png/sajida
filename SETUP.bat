@echo off
echo ====================================
echo Artisan Marketplace - Setup Script
echo ====================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

echo Installing dependencies...
echo This may take 1-2 minutes...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Installation failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the app, run:
echo   npm run dev
echo.
echo Or double-click START.bat
echo.
pause
