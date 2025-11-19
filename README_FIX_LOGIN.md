# 🔥 FIX LOGIN ERROR - "Database error querying schema"

## What You Need to Do RIGHT NOW

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx
2. Click "SQL Editor" in the left menu
3. Click "New query"

### Step 2: Copy This SQL and Run It

```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
```

That's it. Just that ONE line.

### Step 3: Click "Run" (or press Ctrl+Enter)

You should see: `Success. No rows returned`

### Step 4: Test Your App

1. Go back to your app and refresh (F5)
2. Try logging in
3. It should work now!

---

## Still Not Working?

### Try the Full Fix

If the one-liner above didn't work, run this complete script:

```sql
-- Disable RLS on auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Remove any policies on auth.users
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Check if it worked
SELECT
    CASE
        WHEN relrowsecurity = false THEN 'SUCCESS: RLS is now disabled ✓'
        ELSE 'FAILED: RLS is still enabled ✗'
    END as status
FROM pg_class
WHERE oid = 'auth.users'::regclass;
```

---

## What Went Wrong?

Your `auth.users` table (a Supabase system table) has RLS enabled. This table is managed by Supabase and should **NEVER** have RLS enabled - it breaks authentication.

One of your migrations accidentally enabled it. This is the fix.

---

## Need More Help?

If this still doesn't work, you have a permissions issue. You'll need to:

1. Contact Supabase support
2. Or create a new project and migrate your data

But the simple fix above works 99% of the time!

---

## Pro Tip

After login works, **DO NOT** run any migrations that touch `auth.users`. The `auth` schema is Supabase's internal system - leave it alone!
