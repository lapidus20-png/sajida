# Local Setup Guide - Run on Your PC

## Prerequisites

Before you start, install:
- **Node.js** (v18+): https://nodejs.org
- **Git** (optional): https://git-scm.com
- **VS Code** (recommended): https://code.visualstudio.com

## Step-by-Step Setup

### 1. Download Project from Bolt
- Click the **Export/Download** button in Bolt
- Save the ZIP file to your computer
- Extract it to a folder (e.g., `C:\Projects\artisan-marketplace`)

### 2. Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`, type `cmd`, press Enter
- Or use VS Code's integrated terminal

**Mac/Linux:**
- Open Terminal application

### 3. Navigate to Project Folder

```bash
cd C:\Projects\artisan-marketplace
```
(Replace with your actual folder path)

### 4. Install Dependencies

```bash
npm install
```

This will download all required packages (takes 1-2 minutes).

### 5. Configure Supabase Connection

The `.env` file contains your Supabase credentials. Make sure it has:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

These should already be set from Bolt. If not:
1. Go to https://supabase.com
2. Open your project
3. Go to Settings → API
4. Copy the URL and anon key

### 6. Run the App Locally

```bash
npm run dev
```

The app will start at: http://localhost:5173

### 7. Open in Browser

Open your browser and go to: **http://localhost:5173**

## Common Issues

### "npm not found"
- Node.js is not installed or not in PATH
- Solution: Install Node.js and restart your terminal

### "Port already in use"
- Another app is using port 5173
- Solution: Close other apps or change port in `vite.config.ts`

### "Cannot connect to database"
- Check your `.env` file has correct Supabase credentials
- Make sure you're connected to the internet

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint

# Type checking
npm run typecheck
```

## Project Structure

```
artisan-marketplace/
├── src/                  # Source code
│   ├── components/       # React components
│   ├── lib/             # Utilities and services
│   └── main.tsx         # App entry point
├── public/              # Static files
├── supabase/           # Database migrations
├── package.json        # Dependencies
├── .env                # Environment variables
└── vite.config.ts      # Build configuration
```

## Next Steps

1. The app should now run on your PC at http://localhost:5173
2. Any changes you make will hot-reload automatically
3. Your Supabase database is already set up and working
4. To deploy changes, you can use Netlify, Vercel, or push back to Bolt

## Need Help?

- Check the main README.md for project documentation
- Make sure Node.js version is 18 or higher: `node --version`
- Make sure npm is installed: `npm --version`
