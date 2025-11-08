/*
  # Add Automatic User Profile Creation

  1. Changes
    - Drop existing INSERT policy on users table
    - Create a trigger function to automatically create user profiles
    - Set up trigger to fire on auth.users INSERT
    - Add policies for authenticated users to manage their profiles
  
  2. Security
    - Users are created automatically via trigger (bypasses RLS)
    - Users can only read/update their own profiles via RLS
    - Secure and automatic user creation flow
*/

-- Drop the existing INSERT policy since we'll use a trigger instead
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON users;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure users can read their own profile
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON users;
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur profil" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
