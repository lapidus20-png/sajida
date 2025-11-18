/*
  # Remove ALL is_admin() Policies Completely

  ## Problem
  - During login, Supabase checks ALL policies on ALL tables
  - is_admin() queries users table
  - Users table has UPDATE policy using is_admin()
  - This creates circular dependency during auth token generation
  - Result: "Database error querying schema" on login

  ## Solution
  - Remove ALL policies that use is_admin() function
  - Remove the is_admin() function itself
  - Admin functionality will be handled at APPLICATION level only
  - No RLS-level admin checks to avoid any possibility of recursion

  ## Security Approach
  - Users can only modify their own data (enforced by RLS)
  - Admin actions will be checked in application code
  - AdminDashboard component checks user.user_type === 'admin'
  - This is secure because users table is readable but not writable except own profile
*/

-- Drop all admin policies that use is_admin()
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admins can update artisans" ON public.artisans;
DROP POLICY IF EXISTS "Admins can delete artisans" ON public.artisans;
DROP POLICY IF EXISTS "Admins can update job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Admins can delete job requests" ON public.job_requests;

-- Drop the is_admin function completely
DROP FUNCTION IF EXISTS public.is_admin();

-- Note: Admin functionality will be handled at application level
-- The AdminDashboard component will check if user.user_type === 'admin'
-- For database operations, admins can use the service role key if needed
