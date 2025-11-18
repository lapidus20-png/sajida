/*
  # Add Admin Management Policies

  ## Purpose
  - Allow admins to manage all data in the system
  - Admins need to UPDATE and DELETE records for moderation
  - Check user_type from users table (no circular dependency now that SELECT is permissive)

  ## Approach
  - Use subquery to check if current user is admin
  - No circular dependency because users table has permissive SELECT policy
  - This allows (SELECT user_type FROM users WHERE id = auth.uid()) to work

  ## Security
  - Only users with user_type = 'admin' can perform admin actions
  - Regular users still restricted to their own data
  - Read permissions remain permissive for functionality
*/

-- Helper function to check if current user is admin (safe version)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
$$;

-- Admin policies for artisans table
CREATE POLICY "Admins can update artisans"
  ON public.artisans
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete artisans"
  ON public.artisans
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Admin policies for job_requests table  
CREATE POLICY "Admins can update job requests"
  ON public.job_requests
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete job requests"
  ON public.job_requests
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Admin policies for users table
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
