/*
  # Remove problematic trigger and use RPC function instead
  
  1. Changes
    - Drop the trigger that's causing auth issues
    - Create an RPC function that frontend can call after signup
    - This avoids interfering with Supabase Auth internals
    
  2. Security
    - RPC function checks that caller is authenticated
    - Only allows creating profile for the authenticated user
*/

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create RPC function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_type TEXT,
  p_telephone TEXT DEFAULT '',
  p_adresse TEXT DEFAULT '',
  p_ville TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get email from auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville, created_at)
  VALUES (
    v_user_id,
    v_email,
    p_user_type,
    p_telephone,
    p_adresse,
    p_ville,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET user_type = EXCLUDED.user_type,
      telephone = EXCLUDED.telephone,
      adresse = EXCLUDED.adresse,
      ville = EXCLUDED.ville;
  
  RETURN json_build_object(
    'success', true,
    'user_id', v_user_id,
    'user_type', p_user_type
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;