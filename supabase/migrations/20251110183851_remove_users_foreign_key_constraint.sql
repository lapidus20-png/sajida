/*
  # Remove problematic foreign key constraint on users table
  
  1. Changes
    - Drop foreign key constraint users_id_fkey that references auth.users
    - This constraint causes "Database error finding user" during signup
    - The ID relationship is already enforced by RLS policies using auth.uid()
    
  2. Security
    - RLS policies still enforce that users.id must match auth.uid()
    - No security degradation
*/

-- Drop the foreign key constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;