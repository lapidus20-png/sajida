/*
  # Fix Login: Remove FK constraint from public.users to auth.users

  ## Root Cause
  The FK constraint `users_id_fkey` from public.users.id to auth.users.id
  causes PostgreSQL's RI_FKey_noaction_upd trigger to query public.users
  whenever auth.users is updated (including during login when last_sign_in_at changes).
  
  RLS on public.users blocks this query, causing "Database error querying schema".

  ## Fix
  Drop the FK constraint. The id column in public.users already stores auth.users ids,
  and we maintain the relationship through application logic, not database constraint.
*/

-- Drop the problematic FK constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Also drop FK constraints from payment_methods and transactions to auth.users
-- These can also cause issues during auth operations
ALTER TABLE public.payment_methods DROP CONSTRAINT IF EXISTS payment_methods_user_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_payer_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_receiver_id_fkey;

-- Recreate as regular foreign key to public.users instead of auth.users
-- for payment_methods (redirects to public.users which mirrors auth.users ids)
ALTER TABLE public.payment_methods 
  ADD CONSTRAINT payment_methods_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- For transactions, we need to handle both client (in public.users) and artisan (might be in artisans table)
-- Let's keep it flexible - drop the FK and let app logic handle it
-- (transactions can be between any two users, artisan or client)
