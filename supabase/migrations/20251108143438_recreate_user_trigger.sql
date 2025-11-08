/*
  # Recreate User Creation Trigger

  This migration recreates the trigger that automatically creates a user profile
  when a new user signs up via Supabase Auth.

  1. Changes
    - Creates trigger on auth.users table that calls handle_new_user()
    - Ensures user profile is created automatically on signup
*/

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
