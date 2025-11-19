# 🚨 CRITICAL FIX: Auth Users RLS Issue

## The Real Problem

The error "Database error querying schema" is caused by **RLS being enabled on the `auth.users` system table**, which Supabase manages internally. This table should **NEVER** have RLS enabled.

---

## ✅ IMMEDIATE FIX (Run this in Supabase SQL Editor)

### Copy and run this EXACT SQL:

```sql
-- ===================================================================
-- CRITICAL: Disable RLS on auth.users (Supabase system table)
-- ===================================================================

-- This is the root cause - auth.users should NEVER have RLS enabled
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Drop any policies that might exist on auth.users
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', pol.policyname);
    END LOOP;
END $$;

-- Verify RLS is disabled (should return FALSE)
SELECT relrowsecurity as "RLS Enabled on auth.users (should be FALSE)"
FROM pg_class
WHERE oid = 'auth.users'::regclass;
```

---

## If That Doesn't Work, Try This Alternative:

```sql
-- Force disable using postgres superuser
DO $$
BEGIN
    EXECUTE 'ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS disabled on auth.users';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not disable RLS: %', SQLERRM;
END $$;
```

---

## How to Check if Fix Worked

Run this query to verify:

```sql
-- Should return FALSE for auth.users
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';
```

If `RLS Enabled` is **FALSE**, the fix worked!

---

## If You Still Can't Disable RLS

This means you don't have permission to modify the `auth.users` table. In this case:

### Option 1: Contact Supabase Support
The `auth.users` table should not have RLS enabled. This is a Supabase platform issue.

### Option 2: Reset Database Schema
Go to Supabase Dashboard → Project Settings → Database → Reset Database Schema

⚠️ **WARNING**: This will delete all data! Export your data first if needed.

---

## Why This Happens

Someone (or a migration) accidentally enabled RLS on the `auth.users` table:

```sql
-- This command should NEVER be run on auth.users:
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;  ❌ WRONG!
```

The `auth` schema is managed by Supabase and should not be modified by user migrations.

---

## After Fixing

1. Refresh your application
2. Try logging in again
3. Login should work immediately

The issue has nothing to do with your application code - it's purely a database configuration problem.
