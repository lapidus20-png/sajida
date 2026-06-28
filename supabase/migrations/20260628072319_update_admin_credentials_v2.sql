/*
  # Update Admin Credentials
  
  Email: admin@artisanbf.com
  Password: Admin123!
*/

-- First, ensure bcrypt extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Check for existing admin and update or create
DO $$
DECLARE
  existing_admin_id uuid;
BEGIN
  -- Find existing user with admin@artisanbf.com
  SELECT id INTO existing_admin_id FROM auth.users WHERE email = 'admin@artisanbf.com';
  
  IF existing_admin_id IS NOT NULL THEN
    -- Update password for existing admin
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Admin123!', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = existing_admin_id;
    
    -- Ensure public.users has admin type
    INSERT INTO public.users (id, user_type, email, telephone, adresse, ville)
    VALUES (existing_admin_id, 'admin', 'admin@artisanbf.com', '', '', '')
    ON CONFLICT (id) DO UPDATE SET
      user_type = 'admin',
      email = 'admin@artisanbf.com',
      updated_at = now();
      
    RAISE NOTICE 'Updated existing admin@artisanbf.com with new password';
  ELSE
    -- Check if there's an admin user with different email
    SELECT au.id INTO existing_admin_id 
    FROM auth.users au
    JOIN public.users u ON u.id = au.id
    WHERE u.user_type = 'admin'
    LIMIT 1;
    
    IF existing_admin_id IS NOT NULL THEN
      -- Update email and password
      UPDATE auth.users
      SET 
        email = 'admin@artisanbf.com',
        encrypted_password = crypt('Admin123!', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
      WHERE id = existing_admin_id;
      
      UPDATE public.users
      SET 
        email = 'admin@artisanbf.com',
        updated_at = now()
      WHERE id = existing_admin_id;
      
      RAISE NOTICE 'Updated existing admin user to admin@artisanbf.com';
    END IF;
  END IF;
END $$;

-- Verify the admin user credentials
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  u.user_type
FROM auth.users au
JOIN public.users u ON u.id = au.id
WHERE au.email = 'admin@artisanbf.com';
