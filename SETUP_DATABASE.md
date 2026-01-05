# Database Setup Required

## Problem
Your database schema hasn't been created yet, which is why login is failing.

## Quick Fix (2 minutes)

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new

2. **Run the migration:**
   - Open this file: `supabase/migrations/20251206000000_comprehensive_auth_fix.sql`
   - Copy the ENTIRE contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Then run the initial schema:**
   - Open: `supabase/migrations/20251029073237_create_tradesperson_schema.sql`
   - Copy and paste
   - Click "Run"

4. **And the extended schema:**
   - Open: `supabase/migrations/20251031100345_extend_schema_for_full_platform.sql`
   - Copy and paste
   - Click "Run"

### Option 2: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref fldkqlardekarhibnyyx

# Push migrations
supabase db push
```

## After Setup

Once the migrations are applied:

1. Go to: http://localhost:5173
2. Click "Inscription" (Register)
3. Select "Client" or "Artisan"
4. Fill in your details
5. Create your account

## Verify Setup

Run this to check if it worked:

```bash
node scripts/diagnose-login.mjs
```

You should see:
- ✅ Users table is accessible
- ✅ Database schema is ready

## Need Help?

If you see errors, check:
- The migrations ran completely without errors
- No red error messages in the SQL editor
- The tables appear in the Supabase Table Editor
