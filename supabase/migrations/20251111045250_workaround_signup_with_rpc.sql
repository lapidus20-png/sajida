/*
  # Workaround for auth.users RLS issue
  
  1. Changes
    - Remove the problematic trigger on auth.users
    - Create an RPC function that users can call after signup to create their profile
    - This bypasses the RLS issue with auth.users
    
  2. Security
    - Function uses SECURITY DEFINER to bypass RLS
    - Only creates profile for the authenticated user
    - Validates that user_id matches auth.uid()
*/

-- Drop the trigger that's causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a function users can call to create their profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_type TEXT DEFAULT 'client',
  telephone TEXT DEFAULT '',
  adresse TEXT DEFAULT '',
  ville TEXT DEFAULT ''
)
RETURNS json
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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
  
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
  VALUES (user_id, user_email, user_type, telephone, adresse, ville)
  ON CONFLICT (id) DO UPDATE
  SET 
    user_type = EXCLUDED.user_type,
    telephone = EXCLUDED.telephone,
    adresse = EXCLUDED.adresse,
    ville = EXCLUDED.ville;
  
  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', user_id,
    'user_type', user_type
  ) INTO result;
  
  RETURN result;
END;
$$;