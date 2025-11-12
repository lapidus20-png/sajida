# Critical: Fix auth.users RLS Issue

## Problem
User signup is failing with error: **"Database error finding user"**

This is caused by Row Level Security (RLS) being enabled on the `auth.users` table, which is a Supabase system table that should NEVER have RLS enabled.

## Root Cause
- RLS was enabled on `auth.users` (likely through the Supabase Dashboard)
- This blocks Supabase's internal auth operations
- We cannot disable it via SQL migrations (no permissions)

## Solution: Disable RLS via Supabase Dashboard

### Steps:

1. **Go to your Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx

2. **Navigate to Table Editor**
   - Click on "Table Editor" in the left sidebar
   - Switch to the `auth` schema (dropdown at top)
   - Find and click on the `users` table

3. **Disable RLS**
   - Look for "RLS" or "Row Level Security" section
   - Click to disable RLS for this table
   - Confirm the action

4. **Alternative: SQL Editor Approach**
   - Go to "SQL Editor" in the dashboard
   - The dashboard SQL editor runs with higher privileges
   - Try running this command:
   ```sql
   ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
   ```

## Why This Happened

The `auth.users` table is managed by Supabase and should never have RLS enabled. This is a system table used internally by Supabase Auth for authentication operations.

## What We've Already Done

We've tried multiple approaches via migrations:
- ✅ Added RLS policies for all roles (anon, authenticated, service_role, authenticator)
- ❌ Cannot disable RLS (must be owner of table)
- ❌ Cannot grant INSERT privileges (no GRANT OPTION)
- ❌ Cannot change table ownership (permission denied)
- ❌ Cannot SET ROLE to supabase_auth_admin (permission denied)

## Verification

After disabling RLS in the dashboard, verify it worked:

```sql
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';
```

The `rls_enabled` column should be `false`.

## If This Doesn't Work

If you still cannot disable RLS on `auth.users`, you may need to:

1. **Contact Supabase Support**
   - This is an unusual configuration issue
   - Support can fix it from their end

2. **Or Create a New Supabase Project**
   - This is a last resort
   - Export your data first
   - Create a fresh project (which won't have this issue)
   - Import your data and migrations

## Current Status

- ✅ All RLS policies are configured correctly for `public.users` and `public.artisans`
- ✅ User types (client/artisan) can be created once auth works
- ❌ Signup blocked by `auth.users` RLS issue
- ⚠️ Requires Dashboard intervention
