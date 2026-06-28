/*
  # Update Admin Password to admin@2026
*/

-- Update the password for existing admin user
UPDATE auth.users
SET 
  encrypted_password = crypt('admin@2026', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_user_meta_data = '{"user_type":"admin"}',
  updated_at = now()
WHERE email = 'admin@artisanbf.com';

-- Ensure public.users has correct data
UPDATE public.users
SET 
  user_type = 'admin',
  email = 'admin@artisanbf.com',
  updated_at = now()
WHERE id = '6f505d8f-8102-47ee-a404-ee37007f8377';

-- Verify
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  u.user_type
FROM auth.users au
JOIN public.users u ON u.id = au.id
WHERE au.email = 'admin@artisanbf.com';
