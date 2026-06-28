/*
  # Fix is_admin function for Flutter login
  
  Update the is_admin function to check public.users table directly
  instead of relying on JWT app_metadata which may not be available.
*/

-- Update the is_admin function to check public.users table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  );
$$;

-- Update the SELECT policy to ensure it works correctly
DROP POLICY IF EXISTS "Users can read own or admin can read all" ON public.users;

-- Simple policy: users can always read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin can read all
CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (is_admin());
