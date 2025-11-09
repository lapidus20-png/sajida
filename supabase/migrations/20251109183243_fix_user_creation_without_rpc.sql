/*
  # Simplify user creation - remove RPC dependency
  
  1. Changes
    - Drop create_user_profile function (causes auth.users access issues)
    - Add INSERT policy for anon role (for signup flow)
    
  2. Security
    - Anon can insert during signup with matching auth.uid()
    - Authenticated users can read/update their own data
*/

-- Drop the problematic RPC function
DROP FUNCTION IF EXISTS create_user_profile(text, text, text, text);

-- Allow anon to insert during signup (auth.uid() is set during signUp)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Allow insert during signup"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = id);