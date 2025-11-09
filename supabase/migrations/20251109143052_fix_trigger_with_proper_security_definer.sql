/*
  # Fix trigger to properly bypass RLS using SECURITY DEFINER
  
  1. Changes
    - Recreate handle_new_user function with proper SECURITY DEFINER
    - Remove dependency on set_config which doesn't work in triggers
    - Function will run with elevated privileges to bypass RLS
    
  2. Security
    - Function runs as the function owner (postgres/service role)
    - Only used for initial user creation during signup
    - No user input validation needed as data comes from auth.users
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create function that truly bypasses RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into public.users (SECURITY DEFINER allows bypassing RLS)
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', ''),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth.users insert
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();