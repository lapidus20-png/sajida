-- Reset admin passwords to admin@2026
UPDATE auth.users
SET encrypted_password = crypt('admin@2026', gen_salt('bf'))
WHERE email IN ('admin@artisanbf.com', 'admin@builderhub.com');

-- Ensure both accounts are marked as admin in public.users
UPDATE public.users
SET user_type = 'admin'
WHERE email IN ('admin@artisanbf.com', 'admin@builderhub.com');

SELECT email, user_type FROM public.users WHERE email LIKE '%admin%';
