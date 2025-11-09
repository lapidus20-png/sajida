/*
  # Fix Users Table Schema

  This migration fixes the users table to allow NULL telephone values, which was
  preventing the auth trigger from creating user records.

  ## Changes
  
  ### Schema Updates
  - Make `telephone` column nullable with empty string default
  - This allows users to be created without a phone number initially
  - Users can add their phone number later through profile updates

  ## Data Integrity
  The telephone field can be optional at signup and filled in later, which is
  a common pattern in user registration flows.
*/

-- Make telephone nullable and add default value
ALTER TABLE public.users 
  ALTER COLUMN telephone DROP NOT NULL,
  ALTER COLUMN telephone SET DEFAULT '';

-- Migrate existing auth.users to public.users
INSERT INTO public.users (id, email, user_type, telephone, created_at)
SELECT 
  id,
  email,
  'client' as user_type,
  '' as telephone,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
