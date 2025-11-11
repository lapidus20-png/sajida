/*
  # Fix auth.users RLS issue
  
  1. Problem
    - RLS is enabled on auth.users which breaks Supabase auth
    - This is preventing signups with "Database error finding user"
    
  2. Solution
    - Grant necessary permissions to auth schema
    - This migration attempts to fix the permissions issue
    
  3. Note
    - If this doesn't work, the Supabase instance may need to be recreated
    - Contact Supabase support if the issue persists
*/

-- Grant necessary permissions to anon and authenticated roles for auth operations
-- These grants allow Supabase auth to function properly
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- Note: We cannot directly modify auth.users RLS as it's managed by Supabase
-- If the issue persists, this is a Supabase configuration problem that requires
-- contacting Supabase support or recreating the project