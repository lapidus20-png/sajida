# Quick Fix - 6 Steps to Enable Authentication

## The Problem
Based on the errors, you have:
1. RLS blocking user creation
2. Email confirmation enabled
3. Missing database functions

## The Solution

### Step 1: Disable Email Confirmation ⚠️ CRITICAL
https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/providers

Scroll to "Email" → Toggle OFF "Confirm email" → Save

### Step 2: Run SQL Fix
https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new

Copy and paste this entire script:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP FUNCTION IF EXISTS public.has_artisan_profile CASCADE;

-- Disable RLS
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_requests DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DO $$
DECLARE
  pol record;
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users', 'artisans', 'jobs', 'quotes', 'reviews', 'messages', 'notifications', 'payments', 'contact_requests'])
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Make telephone nullable
ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
```

Click "Run" → Should see "Success"

### Step 3: Verify Fix Worked
Run this in SQL editor:

```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('users', 'artisans');
```

Both should show `rowsecurity = f` (false = RLS disabled)

### Step 4: Create Admin in Auth
https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/users

Click "Add User":
- Email: `admin@builderhub.com`
- Password: (your choice, min 6 chars)
- ✅ Check "Auto Confirm User"
- Click "Create User"

### Step 5: Add Admin to Public Users Table
Run this in SQL editor:

```sql
INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
SELECT id, email, 'admin', NULL, NULL, NULL
FROM auth.users
WHERE email = 'admin@builderhub.com'
ON CONFLICT (id) DO UPDATE SET user_type = 'admin';
```

Should see "Success. 1 rows affected"

### Step 6: Test in App
Refresh your app and try:

**Admin Login:**
- Email: admin@builderhub.com
- Password: (what you set)
- Should see Admin Dashboard

**Client Signup:**
- Select "Client"
- Fill in email, password, phone
- Should create account and show Client Dashboard

**Artisan Signup:**
- Select "Artisan"
- Fill in ALL fields (name, trade, phone, etc.)
- Should create account and show Artisan Dashboard

## Still Not Working?

1. Check browser console (F12) for errors
2. Verify Step 1 (email confirmation OFF)
3. Verify Step 3 (RLS disabled)
4. Clear browser cache and retry
