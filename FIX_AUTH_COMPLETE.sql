-- Fix Auth Login Issue - Complete Version
-- This disables RLS on auth.users and properly configures public.users

-- Step 1: Disable RLS on auth.users (system table)
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on auth.users
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

-- Step 3: Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies on public.users
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_select_all" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_insert_own" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_update_own" ON public.users;

-- Step 5: Create new policies for public.users

-- SELECT: Allow all authenticated users to view all profiles
CREATE POLICY "authenticated_users_select_all"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- INSERT: Allow authenticated users to create their own profile only
CREATE POLICY "authenticated_users_insert_own"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Allow authenticated users to update their own profile only
CREATE POLICY "authenticated_users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
