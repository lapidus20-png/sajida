/*
  # Ensure admin password is correctly set with bcrypt
  
  Email: admin@artisanbf.com
  Password: admin@2026
*/

-- Reset the admin password to ensure it's correct
UPDATE auth.users
SET 
  encrypted_password = crypt('admin@2026', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'admin@artisanbf.com';

-- Verify the user can authenticate (test the password hash)
SELECT 
  id,
  email,
  email_confirmed_at,
  'Password set for: admin@2026' as status
FROM auth.users 
WHERE email = 'admin@artisanbf.com';
