# Fix: Permission Error - "must be owner of table users"

## Why This Error Happens

You're getting this error because:
1. You're not logged in as the database owner in Supabase
2. You need to run the SQL as a Superuser/Owner

## Solution: Use Supabase Dashboard SQL Editor

The Supabase SQL Editor automatically runs commands with the right permissions.

### Step 1: Open SQL Editor as Owner

**IMPORTANT:** You must be logged in as the project owner/creator.

Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new

### Step 2: Copy This EXACT SQL

```sql
-- This will disable RLS temporarily to allow login
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- Make telephone optional
ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;
```

### Step 3: Click "RUN" Button

Look for the green "RUN" button in the SQL editor. Click it.

You should see: "Success. No rows returned"

### Step 4: Disable Email Confirmation

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/providers
2. Scroll to the "Email" section
3. Find "Confirm email" toggle
4. Turn it OFF (should be gray/disabled)
5. Click "Save" at the bottom

### Step 5: Create Admin User Through UI

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/users
2. Click "Add User" button (green button, top right)
3. Fill in:
   - Email: `admin@builderhub.com`
   - Password: (choose any password, min 6 chars)
   - ✅ CHECK "Auto Confirm User"
4. Click "Create User"

### Step 6: Link Admin to Database

Run this in SQL Editor:

```sql
INSERT INTO public.users (id, email, user_type)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@builderhub.com'
ON CONFLICT (id) DO UPDATE SET user_type = 'admin';
```

### Step 7: Test Login

1. Refresh your app
2. Click "Connexion"
3. Enter:
   - Email: admin@builderhub.com
   - Password: (what you set in Step 5)
4. Should see Admin Dashboard

## Still Getting Permission Error?

You might not be the project owner. Ask your team:

**"Who created this Supabase project?"**

That person needs to:
1. Log into Supabase dashboard
2. Follow steps above
3. Or add you as an owner in project settings

## Alternative: Create New Supabase Project

If you can't access the dashboard as owner:

1. Create a new free Supabase project at https://supabase.com
2. Update your `.env` file with the new credentials
3. Run migrations to set up tables
4. Create admin user

This will take 10 minutes but gives you full control.
