/*
  # Generate proper password hashes using Supabase's crypt()
*/

-- Reset admin password using crypt()
UPDATE auth.users 
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@builderhub.com';

-- Reset client password
UPDATE auth.users 
SET 
  encrypted_password = crypt('test123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'client@test.com';

-- Reset artisan password
UPDATE auth.users 
SET 
  encrypted_password = crypt('test123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'artisan@test.com';
