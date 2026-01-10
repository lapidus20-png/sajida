# How to Download and Run on Your PC

## Quick Start

### For Windows Users:

1. **Download the project** - Click Export/Download in Bolt
2. **Extract the ZIP** to a folder (e.g., `C:\Projects\artisan-marketplace`)
3. **Double-click `SETUP.bat`** - This installs everything
4. **Double-click `START.bat`** - This runs the app
5. **Open browser** to http://localhost:5173

### For Mac/Linux Users:

1. **Download the project** - Click Export/Download in Bolt
2. **Extract the ZIP** to a folder
3. **Open Terminal** in that folder
4. **Run setup:**
   ```bash
   chmod +x setup.sh start.sh
   ./setup.sh
   ```
5. **Start app:**
   ```bash
   ./start.sh
   ```
6. **Open browser** to http://localhost:5173

## What You Need

Before starting, install **Node.js** from: https://nodejs.org

That's it! Node.js includes npm (package manager) automatically.

## Folder Structure After Download

```
artisan-marketplace/
├── SETUP.bat          ← Windows: Double-click this first!
├── START.bat          ← Windows: Double-click to run app
├── setup.sh           ← Mac/Linux: Run this first
├── start.sh           ← Mac/Linux: Run to start app
├── LOCAL_SETUP_GUIDE.md  ← Detailed instructions
├── src/               ← Your app code
├── public/            ← Static files
├── .env               ← Supabase credentials (already set)
└── package.json       ← Dependencies list
```

## Your Supabase Database

Your database is already configured and ready to use! The `.env` file contains all the connection details. No additional database setup needed.

## Troubleshooting

**"Node.js not found"**
- Install Node.js from https://nodejs.org
- Restart your computer
- Try again

**"Port 5173 already in use"**
- Close other applications
- Or edit `vite.config.ts` to use a different port

**App opens but shows errors**
- Check your internet connection (needed for Supabase)
- Verify `.env` file exists and has your Supabase credentials

## Need More Help?

Read `LOCAL_SETUP_GUIDE.md` for detailed instructions and troubleshooting.

## What Happens When You Run the App?

1. The development server starts
2. Your browser opens automatically (or go to http://localhost:5173)
3. The app connects to your Supabase database
4. Any code changes you make will update automatically (hot reload)

## Stopping the App

Press `Ctrl + C` in the terminal/command prompt window.

---

**That's it!** Your artisan marketplace app will be running on your PC, connected to your Supabase database in the cloud.
