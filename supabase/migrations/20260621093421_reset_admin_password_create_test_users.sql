/*
  # Reset admin password and create test users
*/

-- Reset password for existing admin user
-- Using crypt with gen_salt to hash the password
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@builderhub.com';

-- Create test client user if not exists
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  deleted_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'client@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"user_type":"client"}',
  false,
  null
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@test.com');

-- Create test artisan user if not exists  
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  deleted_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'artisan@test.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"user_type":"artisan"}',
  false,
  null
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'artisan@test.com');
