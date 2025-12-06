# Fix Authentication "Database error finding user"

## The Problem
You're getting "Database error finding user" when trying to sign up. This happens when the `auth.users` table has RLS policies or triggers that interfere with Supabase's authentication.

## Quick Fix (Run in Supabase SQL Editor)

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Disable RLS on auth.users (this is critical!)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Drop any policies on auth.users
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

-- Drop any triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
```

## Verify the Fix

After running the SQL above, run this to verify:

```sql
-- Check RLS status (should be FALSE)
SELECT relrowsecurity as rls_enabled
FROM pg_class
WHERE oid = 'auth.users'::regclass;

-- Check for policies (should return 0)
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'auth' AND tablename = 'users';

-- Check for triggers (should return 0)
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
```

## Additional Check: Email Domain Restrictions

If you still get errors after the above fix, check your Auth settings:

1. Go to Authentication → Providers → Email
2. Check if there are any email domain restrictions
3. Disable "Confirm email" if it's enabled (unless you need it)

## Test Signup

After applying the fix, try signing up with a real email address in your app. The error should be resolved.
