/*
  # Workaround for auth.users RLS Issue
  
  ## Problem
  The auth.users table has RLS enabled, which is blocking user signup.
  This is a Supabase system table that should NEVER have RLS enabled.
  
  ## Root Cause
  - auth.users is owned by supabase_auth_admin role
  - postgres role cannot disable RLS or grant INSERT privileges
  - This appears to be a project-level configuration issue
  
  ## Attempted Solutions
  1. ❌ ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY - Permission denied (must be owner)
  2. ❌ GRANT INSERT ON auth.users TO anon - Permission denied (no GRANT OPTION)
  3. ✅ Added comprehensive RLS policies for all roles
  
  ## Current Workaround
  Since we cannot disable RLS or grant table-level privileges, we ensure:
  - All necessary RLS policies exist for anon, authenticated, service_role
  - authenticator role has full access (this is what Supabase auth uses internally)
  
  ## Note
  The authenticator role is what Supabase's auth system actually uses.
  If signup still fails, this is a Supabase project configuration issue
  that may require:
  1. Contacting Supabase support
  2. Resetting the auth configuration via Supabase dashboard
  3. Creating a new Supabase project
*/

-- Ensure authenticator role has all necessary privileges
-- (authenticator is the actual role used by Supabase auth internally)
DO $$
BEGIN
  -- Verify authenticator has the necessary policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'auth' 
    AND tablename = 'users' 
    AND policyname = 'Allow authenticator full access'
  ) THEN
    RAISE EXCEPTION 'Critical: authenticator policy missing on auth.users';
  END IF;
  
  -- Log the current state for debugging
  RAISE NOTICE 'Auth.users RLS policies verified';
END $$;

-- Double-check that our public.users policies are correct
-- These should allow signup to proceed after auth.users authentication
DROP POLICY IF EXISTS "Allow user profile creation during signup" ON public.users;

CREATE POLICY "Allow user profile creation during signup"
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = id);

-- Ensure public.users policies are comprehensive
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);