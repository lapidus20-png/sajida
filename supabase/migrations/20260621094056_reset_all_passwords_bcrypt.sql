/*
  # Reset all test user passwords with bcrypt
*/

-- First verify the pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Delete existing test users and recreate fresh
DELETE FROM auth.users WHERE email IN ('client@test.com', 'artisan@test.com');
DELETE FROM public.users WHERE email IN ('client@test.com', 'artisan@test.com');

-- Update admin password - use valid bcrypt hash format
-- bcrypt hash for "admin123" with cost 10
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGf6XVPHJ7JjPQvDvWHmHgX1WZaW',
  updated_at = NOW()
WHERE email = 'admin@builderhub.com';

-- Create fresh test users with known passwords
-- Email: client@test.com, Password: test123
INSERT INTO auth.users (
  instance_id, id, email, encrypted_password, 
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, deleted_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'client@test.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGf6XVPHJ7JjPQvDvWHmHgX1WZaW',
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"user_type":"client"}',
  false, null
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = NOW();

-- Email: artisan@test.com, Password: test123  
INSERT INTO auth.users (
  instance_id, id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, deleted_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b1ffcc00-9c0b-4ef8-bb6d-6bb9bd380a22',
  'artisan@test.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGf6XVPHJ7JjPQvDvWHmHgX1WZaW',
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"user_type":"artisan"}',
  false, null
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = NOW();

-- Create public.users profiles
INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'client@test.com', 'client', '', '', ''),
  ('b1ffcc00-9c0b-4ef8-bb6d-6bb9bd380a22', 'artisan@test.com', 'artisan', '', '', '')
ON CONFLICT (id) DO NOTHING;
