# Apply Multi-Artisan Selection - Quick Setup

## 3 Simple Steps

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project (fldkqlardekarhibnyyx)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy and Paste SQL
1. Open the file `APPLY_MULTI_ARTISAN_NOW.sql` in this project
2. Copy ALL the SQL (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Success
You should see: "Success. No rows returned"

That's it! The feature is now active.

## What You Just Enabled

- ✅ Clients can select up to 3 artisans per job
- ✅ Artisans get automatic notifications when selected
- ✅ Selection order is tracked (1st, 2nd, 3rd choice)
- ✅ Secure Row Level Security policies

## Test It

1. Log in as a client
2. Go to a job with quotes
3. Click "Voir candidats"
4. Select 1-3 artisans (click their cards)
5. Click "Sélectionner ces X artisans"
6. Check that artisans receive notifications

## Already Applied?

If you see errors like "relation already exists", the migration was already applied successfully. You're good to go!

## Need Help?

Check the full documentation in `MULTI_ARTISAN_SELECTION_SETUP.md`
