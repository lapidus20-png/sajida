/*
  # Temporarily disable RLS on users table to test auth
  
  1. Changes
    - Disable RLS on public.users to diagnose auth issue
    - This is temporary - will re-enable once we find the problem
    
  2. Note
    - This is for diagnostic purposes only
    - Will re-enable RLS after identifying the issue
*/

-- Temporarily disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;