# Apply Authentication Fix

## The Problem
You're getting "must be owner of table users" because you don't have permission to modify the auth.users table directly.

## Solution: Apply the Migration via Supabase Dashboard

### Step 1: Go to SQL Editor
1. Open your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Run This SQL
Copy the ENTIRE contents of the file below and paste it into the SQL Editor:

**File:** `supabase/migrations/20251206000000_comprehensive_auth_fix.sql`

Then click **Run** (or press Ctrl+Enter)

### Step 3: Verify the Fix
After running the migration, run this verification query:

```sql
-- Check if auth.users RLS is disabled (should return false)
SELECT relrowsecurity as rls_enabled
FROM pg_class
WHERE oid = 'auth.users'::regclass;

-- Check for auth policies (should return 0)
SELECT COUNT(*) as auth_policy_count
FROM pg_policies
WHERE schemaname = 'auth';
```

### Expected Results
- `rls_enabled`: **false** (RLS is disabled)
- `auth_policy_count`: **0** (no policies blocking auth)

## Test Signup
After applying the fix, try signing up in your application. It should work without errors.

## Alternative: Use Supabase CLI
If you have the Supabase CLI installed locally, you can apply all pending migrations:

```bash
supabase db push
```

This will apply all migrations in the `supabase/migrations/` folder.
