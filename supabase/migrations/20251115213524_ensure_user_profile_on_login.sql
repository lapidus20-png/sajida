/*
  # Ensure User Profile Exists on Login

  1. Problem
    - Users can log in but their profile in public.users might not exist
    - This causes the app to redirect back to login after authentication
    - Existing users (like admin) don't have proper profile setup

  2. Solution
    - Create a function to ensure user profile exists
    - Call this on login to auto-create missing profiles
    - Update create_user_profile to work for both signup and login

  3. Changes
    - Add get_or_create_user_profile function
    - This will be called from the frontend after login
*/

-- Drop and recreate the create_user_profile function with better error handling
DROP FUNCTION IF EXISTS create_user_profile(text, text, text, text);

CREATE OR REPLACE FUNCTION create_user_profile(
  user_type text DEFAULT 'client',
  telephone text DEFAULT '',
  adresse text DEFAULT '',
  ville text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id uuid;
  user_email text;
  result json;
BEGIN
  -- Get current user from auth
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  -- Insert or update user profile
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
  VALUES (user_id, user_email, user_type, telephone, adresse, ville)
  ON CONFLICT (id) DO UPDATE
  SET 
    user_type = COALESCE(NULLIF(EXCLUDED.user_type, ''), users.user_type),
    telephone = COALESCE(NULLIF(EXCLUDED.telephone, ''), users.telephone),
    adresse = COALESCE(NULLIF(EXCLUDED.adresse, ''), users.adresse),
    ville = COALESCE(NULLIF(EXCLUDED.ville, ''), users.ville),
    updated_at = now();
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', user_id,
    'user_type', user_type
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create a new function specifically for login (ensures profile exists)
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_id uuid;
  user_email text;
  existing_user users%ROWTYPE;
  result json;
BEGIN
  -- Get current authenticated user
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  -- Check if user profile exists
  SELECT * INTO existing_user
  FROM public.users
  WHERE id = user_id;
  
  -- If profile doesn't exist, create it with default values
  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
    VALUES (user_id, user_email, 'client', '', '', '')
    RETURNING * INTO existing_user;
  END IF;
  
  -- Return user data
  SELECT json_build_object(
    'success', true,
    'user_id', existing_user.id,
    'email', existing_user.email,
    'user_type', existing_user.user_type,
    'telephone', existing_user.telephone,
    'adresse', existing_user.adresse,
    'ville', existing_user.ville
  ) INTO result;
  
  RETURN result;
END;
$$;
