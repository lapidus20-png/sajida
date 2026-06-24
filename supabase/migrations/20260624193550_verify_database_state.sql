/*
  # Verify Database State
  
  Check:
  1. users rows exist for each auth user with user_type set
  2. job_requests.statut values match expected enum
  3. artisans.user_id links properly to users.id
*/

-- 1. Find auth users without public.users profile
SELECT 
  au.id as auth_id,
  au.email,
  au.raw_user_meta_data->>'user_type' as meta_user_type,
  u.id as public_user_id,
  u.user_type as public_user_type
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Check for mismatched user_type between auth metadata and users table
SELECT 
  au.email,
  au.raw_user_meta_data->>'user_type' as auth_meta_type,
  u.user_type as users_type
FROM auth.users au
JOIN public.users u ON u.id = au.id
WHERE au.raw_user_meta_data->>'user_type' IS DISTINCT FROM u.user_type;

-- 3. Check artisans without proper user_id link
SELECT 
  a.id as artisan_id,
  a.nom,
  a.prenom,
  a.user_id,
  CASE WHEN a.user_id IS NULL THEN 'NO USER_ID'
       WHEN NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = a.user_id) THEN 'INVALID USER_ID'
       ELSE 'OK' END as link_status
FROM public.artisans a
WHERE a.user_id IS NULL 
   OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = a.user_id);

-- 4. Check distinct statut values in job_requests
SELECT DISTINCT statut FROM public.job_requests ORDER BY statut;

-- 5. Count users by type
SELECT user_type, COUNT(*) as count FROM public.users GROUP BY user_type ORDER BY user_type;
