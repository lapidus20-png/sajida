# Fix: Budget Column Schema Cache Issue

## Problem
The `budget` column was added to the database but Supabase's PostgREST API layer hasn't refreshed its schema cache, causing the error:
```
Could not find the 'budget' column of 'job_requests' in the schema cache
```

## Solution

### Option 1: Run SQL Directly in Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the SQL**
   - Open the file `FIX_BUDGET_COLUMN.sql` in this project
   - Copy all the SQL content
   - Paste it into the SQL Editor

4. **Run the SQL**
   - Click "Run" or press `Ctrl+Enter`
   - Wait for the query to complete
   - You should see a success message

5. **Verify the fix**
   - After running the SQL, wait 30 seconds
   - Refresh your application
   - The error should be gone

### Option 2: Wait for Automatic Schema Refresh

Supabase automatically refreshes the PostgREST schema cache every few minutes. If you prefer not to run SQL manually:

1. Wait 5-10 minutes
2. Refresh your application
3. The budget column should now be accessible

### Option 3: Restart PostgREST (If you have access)

If you have direct access to restart the PostgREST server:

1. Go to your Supabase project settings
2. Find the PostgREST restart option
3. Click restart
4. Wait 1-2 minutes for the service to come back up

## What the Fix Does

The SQL script:
1. Adds the `budget` column to the `job_requests` table (if not exists)
2. Creates the `unlocked_client_details` table for tracking when artisans pay to access client info
3. Sets up Row Level Security (RLS) policies
4. Creates performance indexes
5. Verifies the column was added successfully

## After the Fix

Once the budget column is accessible:
- Clients can enter a single budget amount when creating job requests
- This budget is visible only to clients
- Artisans must pay 25% of the budget to unlock client contact details
- When unlocked, artisans can see client name, email, and phone number

## Need Help?

If you continue to experience issues:
1. Check the Supabase dashboard for any error messages
2. Verify the SQL ran successfully without errors
3. Try refreshing the page after a few minutes
4. Check browser console for additional error details
