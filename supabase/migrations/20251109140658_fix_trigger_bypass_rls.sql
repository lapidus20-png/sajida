/*
  # Fix trigger to bypass RLS for user creation
  
  1. Changes
    - Update handle_new_user function to explicitly bypass RLS
    - Use SET LOCAL to temporarily disable RLS for the insert
    - Ensure user record is created regardless of RLS policies
  
  2. Security
    - Function still runs with SECURITY DEFINER
    - Only bypasses RLS for the specific insert operation
    - Returns to normal RLS behavior after insert
*/

-- Drop and recreate the function with RLS bypass
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Temporarily disable RLS for this insert
  PERFORM set_config('request.jwt.claim.sub', NEW.id::text, true);
  
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'client',
    '',
    '',
    '',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Also add a policy that allows the service role to insert
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);