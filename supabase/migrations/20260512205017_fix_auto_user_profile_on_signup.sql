/*
  # Fix Login: Auto-create user profile on auth signup

  ## Problem
  When a user signs up via Supabase Auth, no row is automatically created in 
  the public.users table. MainApp.tsx then calls signOut() if no user profile 
  is found, making login impossible for users without a profile.

  ## Changes
  1. Add a trigger function on auth.users that auto-inserts into public.users
  2. Handle existing auth users who have no profile yet (backfill not needed 
     since table is empty, but trigger covers all new signups)

  ## Security
  - Function runs as SECURITY DEFINER to bypass RLS when creating the initial profile
  - Only triggers on INSERT to auth.users (new signups)
*/

-- Function to auto-create public.users profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
