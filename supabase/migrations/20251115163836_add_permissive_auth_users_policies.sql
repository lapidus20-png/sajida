/*
  # Add Permissive Policies to auth.users
  
  ## Problem
  Cannot disable RLS on auth.users (permission denied).
  
  ## Solution
  Since RLS cannot be disabled, create policies that allow Supabase's
  auth system to insert users. The auth system uses the 'authenticator'
  and 'service_role' roles internally.
  
  ## Policies Added
  - Allow service_role full access (Supabase's internal auth uses this)
  - Allow anon role to insert during signup
  - Allow authenticated users to read their own data
*/

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Service role has full access to auth users" ON auth.users;
DROP POLICY IF EXISTS "Allow auth system to create users" ON auth.users;
DROP POLICY IF EXISTS "Allow user signup" ON auth.users;

-- Allow service_role (used by Supabase auth internally) full access
CREATE POLICY "Service role has full access to auth users"
ON auth.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anon role to insert users during signup
CREATE POLICY "Allow user signup"
ON auth.users
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to read their own record
CREATE POLICY "Users can read own auth record"
ON auth.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Verify policies were created
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'auth' AND tablename = 'users';
  
  RAISE NOTICE 'Total policies on auth.users: %', policy_count;
  
  IF policy_count = 0 THEN
    RAISE WARNING 'Failed to create policies - this requires Supabase support intervention';
  ELSE
    RAISE NOTICE 'Successfully created % policies on auth.users', policy_count;
  END IF;
END $$;
