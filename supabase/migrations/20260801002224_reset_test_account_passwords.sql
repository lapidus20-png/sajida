-- Reset test account passwords
-- client@test.com -> client123
-- artisan@test.com -> artisan123
UPDATE auth.users
SET encrypted_password = crypt('client123', gen_salt('bf'))
WHERE email = 'client@test.com';

UPDATE auth.users
SET encrypted_password = crypt('artisan123', gen_salt('bf'))
WHERE email = 'artisan@test.com';

-- Ensure user types are correct
UPDATE public.users SET user_type = 'client' WHERE email = 'client@test.com';
UPDATE public.users SET user_type = 'artisan' WHERE email = 'artisan@test.com';

SELECT email, user_type FROM public.users ORDER BY email;
