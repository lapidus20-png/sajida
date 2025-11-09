/*
  # Fix authentication trigger for user signup
  
  1. Changes
    - Drop the incorrect trigger on public.users table
    - Create trigger on auth.users table instead
    - This ensures user profile is created automatically when auth user signs up
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS during auto-creation
    - Uses ON CONFLICT DO NOTHING to handle race conditions
*/

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users;

-- Drop and recreate the function to ensure it's correct
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
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

-- Create trigger on auth.users table (this is the correct location)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();