# Simple Fix Without SQL (No Permission Needed)

Can't run SQL due to permission errors? Use this UI-only approach.

## Method 1: Disable Email Confirmation (5 seconds)

This is the #1 reason login fails.

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/providers
2. Scroll down to "Email" section
3. Toggle OFF "Confirm email"
4. Click "Save"

## Method 2: Create Admin Via UI (30 seconds)

1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/users
2. Click "Add User" (green button)
3. Enter:
   - Email: your.email@example.com
   - Password: (min 6 characters)
   - ✅ CHECK "Auto Confirm User"
4. Click "Create User"
5. Copy the User ID that appears

## Method 3: Use Existing Account

You already have these accounts in the database:

- lapidus20@gmail.com (admin)
- admin@builderhub.com (admin)
- lapidus20@yahoo.co.uk (client)
- ismaelhamadou@hotmail.com (client)

Just log in with one of these (if you know the password).

## Method 4: Sign Up as New User

1. Refresh your app
2. Click "Inscription" (Register)
3. Select "Client"
4. Fill in:
   - Email
   - Password (min 6 chars)
   - Phone
5. Click "Créer mon compte"

This should work if Method 1 (email confirmation) is disabled.

## Still Not Working?

The RLS (Row Level Security) is likely blocking access. You'll need someone with Supabase dashboard owner access to run:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

See `FIX_PERMISSION_ERROR.md` for details on who can do this.

## Quick Test

Try this first before anything else:

1. Disable email confirmation (Method 1)
2. Click "Voir la démo" button in the app
3. This loads a demo dashboard to verify the app works

If demo works but login doesn't, it's definitely an auth configuration issue.
