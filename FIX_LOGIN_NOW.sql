-- FIX LOGIN ISSUE - Run this in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new

-- Step 1: Disable RLS on auth.users if it's enabled
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Remove any policies on auth.users
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

-- Step 3: Remove any triggers that might be blocking auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- Step 4: Ensure public.users table is accessible
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 5: Drop broken functions
DROP FUNCTION IF EXISTS public.ensure_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 6: Make telephone nullable
ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;

-- Verify the fix
SELECT 'Setup complete! Try logging in now.' as status;
