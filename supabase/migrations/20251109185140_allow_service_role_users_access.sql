/*
  # Allow service_role to access users table
  
  1. Changes
    - Add policy for service_role to bypass RLS on users table
    - This allows Supabase auth system to check user existence during signup
    
  2. Security
    - service_role is only used internally by Supabase
    - Does not expose any data to end users
*/

-- Allow service_role to bypass RLS entirely (this is the internal Supabase role)
DROP POLICY IF EXISTS "Service role full access" ON public.users;

CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);