# Enable Client & Artisan Signup - Quick Fix

## The Problem
Your database currently has RLS (Row Level Security) disabled on all tables, which prevents proper signup functionality for clients and artisans.

## The Solution
Apply the security policies that allow users to create their own profiles during signup.

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx
2. Log in to your Supabase account

### Step 2: Navigate to SQL Editor
1. Click on the **SQL Editor** icon in the left sidebar (looks like a terminal window)
2. Click **New Query** button in the top right

### Step 3: Apply the Fix
1. Open the file `FIX_SIGNUP_RLS.sql` from your project folder
2. Copy ALL the contents of that file
3. Paste it into the SQL Editor query window
4. Click the **Run** button (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify Success
You should see a success message with: "Total RLS policies created: [number]"

If you see any errors, please copy the entire error message and share it.

---

## What This Fix Does

1. **Enables Row Level Security (RLS)** on all important tables
2. **Creates signup policies** that allow:
   - Clients to create their profiles
   - Artisans to create their profiles AND artisan listings
3. **Creates access policies** that allow:
   - Users to read/update their own data
   - Artisans to view job requests
   - Clients to post job requests
   - Everyone to view artisan profiles (public directory)
   - Admins to manage everything

---

## After Applying the Fix

### Test Client Signup:
1. Go to your BuilderHub app
2. Click on **Inscription** (Register)
3. Select **Client**
4. Fill in the form with:
   - Email
   - Password (min 6 characters)
   - Phone number
   - Address (optional)
   - City (optional)
5. Click **Créer mon compte**

### Test Artisan Signup:
1. Go to your BuilderHub app
2. Click on **Inscription** (Register)
3. Select **Artisan**
4. Fill in the form with:
   - Email
   - Password (min 6 characters)
   - First name (Nom)
   - Last name (Prénom)
   - Phone number
   - Métier (Trade/Profession)
   - Address (optional)
   - City (optional)
5. Click **Créer mon compte**

---

## Security Notes

- All user data is protected by Row Level Security
- Users can only access their own data
- Artisan profiles are public (this is intentional for the directory)
- Admins have full access to manage the platform
- The admin account (admin@builderhub.com) already exists and works

---

## If You Still Have Issues

If signup still doesn't work after applying this fix, please:

1. Check the browser console for errors (F12 → Console tab)
2. Try logging in with the admin account first:
   - Email: admin@builderhub.com
   - Password: Admin123!
3. Share any error messages you see

The most common issue is forgetting to run the SQL script, so make sure you completed Step 3 above.
