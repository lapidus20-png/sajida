# Fix Authentication for Admin, Client, and Artisan

Follow these steps to enable authentication:

## Step 1: Run the SQL Fix

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new
2. Copy all content from `FIX_AUTH_COMPLETE.sql`
3. Paste into the SQL editor
4. Click "Run"

This will:
- Remove all problematic triggers and functions
- Disable RLS temporarily to allow authentication
- Make telephone field optional
- Clean up all existing policies

## Step 2: Create Admin Account

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/users
2. Click "Add User"
3. Fill in:
   - Email: `admin@builderhub.com`
   - Password: Choose a secure password (min 6 characters)
   - Auto Confirm User: YES (check this box)
4. Click "Create User"

The SQL script will automatically add this user to the `public.users` table with admin privileges.

## Step 3: Test the Application

### Test Admin Login:
1. Open the app
2. Click "Connexion"
3. Enter:
   - Email: `admin@builderhub.com`
   - Password: (the password you set)
4. You should see the Admin Dashboard

### Test Client Signup:
1. Click "Inscription"
2. Select "Client" radio button
3. Fill in:
   - Email: your email
   - Password: min 6 characters
   - Phone number
   - Name and other details
4. Click "Créer mon compte"
5. You should see the Client Dashboard

### Test Artisan Signup:
1. Click "Inscription"
2. Select "Artisan" radio button
3. Fill in:
   - Email: your email
   - Password: min 6 characters
   - Name (Nom)
   - First name (Prénom)
   - Phone number
   - Trade (Métier) - select from dropdown
   - Address and City
4. Click "Créer mon compte"
5. You should see the Artisan Dashboard

## Troubleshooting

If you still get errors:

1. Check browser console (F12) for error messages
2. Verify the SQL ran successfully in Supabase
3. Check that the admin user was created in Supabase Auth
4. Try logging out and back in
5. Clear browser cache and try again

## Security Note

RLS is currently disabled for testing. Once authentication is working, you should:
1. Re-enable RLS on all tables
2. Add proper security policies
3. Test that users can only access their own data
