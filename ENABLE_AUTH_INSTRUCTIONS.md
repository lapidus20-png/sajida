# Fix Authentication for Admin, Client, and Artisan

## CRITICAL: Follow ALL steps in order

### Step 1: Disable Email Confirmation

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/providers
2. Scroll down to "Email" section
3. Find "Confirm email" toggle
4. **TURN OFF** email confirmation
5. Click "Save"

### Step 2: Run the SQL Fix

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new
2. Copy **ALL** content from `FIX_AUTH_COMPLETE.sql`
3. Paste into the SQL editor
4. Click "Run"
5. Verify success: You should see "Success. No rows returned"

This will:
- Remove all problematic triggers and functions
- Disable RLS to allow authentication
- Make telephone field optional
- Clean up all existing policies

### Step 3: Verify the Fix

Run these verification queries in the SQL editor:

```sql
-- Check if RLS is disabled (should show 'f' for false)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'artisans');
```

Expected result: Both should show `rowsecurity = f`

### Step 4: Create Admin Account

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/users
2. Click "Add User"
3. Fill in:
   - Email: `admin@builderhub.com`
   - Password: Choose a secure password (min 6 characters)
   - **Auto Confirm User: YES** (MUST check this box)
4. Click "Create User"

### Step 5: Add Admin to Users Table

Run this in the SQL editor:

```sql
INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
SELECT id, email, 'admin', NULL, NULL, NULL
FROM auth.users
WHERE email = 'admin@builderhub.com'
ON CONFLICT (id) DO UPDATE SET user_type = 'admin';
```

You should see "Success. 1 rows affected."

### Step 6: Test the Application

#### Test 1: Admin Login
1. Refresh the app (Ctrl+R or Cmd+R)
2. Click "Connexion"
3. Enter:
   - Email: `admin@builderhub.com`
   - Password: (the password you set in Step 4)
4. **Expected**: You should see the Admin Dashboard

#### Test 2: Client Signup
1. Log out if logged in
2. Click "Inscription"
3. Select "Client" radio button
4. Fill in:
   - Email: test-client@example.com
   - Password: test123 (min 6 characters)
   - Telephone: +226 12345678
   - Name/Prenom: (optional for clients)
   - Adresse: (optional)
   - Ville: (optional)
5. Click "Créer mon compte"
6. **Expected**: You should see the Client Dashboard

#### Test 3: Artisan Signup
1. Log out if logged in
2. Click "Inscription"
3. Select "Artisan" radio button
4. Fill in ALL required fields:
   - Email: test-artisan@example.com
   - Password: test123 (min 6 characters)
   - Nom: Doe
   - Prénom: John
   - Téléphone: +226 87654321
   - Métier: Select "Plombier" or any trade
   - Adresse: 123 rue example
   - Ville: Ouagadougou
5. Click "Créer mon compte"
6. **Expected**: You should see the Artisan Dashboard

## Troubleshooting

### Error: "new row violates row-level security policy"
- The SQL fix wasn't run or didn't work
- Go back to Step 2 and verify the SQL ran successfully
- Check Step 3 verification queries

### Error: "Email not confirmed"
- Email confirmation is still enabled
- Go back to Step 1 and make sure to DISABLE email confirmation
- Save the settings

### Error: "insert or update on table artisans violates foreign key"
- The users table insert failed first
- This is usually caused by RLS still being enabled
- Run the verification queries from Step 3

### Admin can't log in
- Make sure you completed Step 5 (adding admin to public.users)
- Verify with this query:
  ```sql
  SELECT * FROM public.users WHERE email = 'admin@builderhub.com';
  ```
- Should return 1 row with user_type = 'admin'

### Still having issues?
1. Open browser console (F12) and check for error messages
2. Take a screenshot of the error
3. Verify email confirmation is OFF in Supabase settings
4. Verify RLS is disabled by running the verification queries

## Security Note

**IMPORTANT**: RLS is currently disabled for testing. This means anyone can read/write any data. This is NOT secure for production.

Once authentication is working properly, you need to:
1. Re-enable RLS on all tables
2. Create proper security policies
3. Test that users can only access their own data
4. Test that artisans can't access admin functions
