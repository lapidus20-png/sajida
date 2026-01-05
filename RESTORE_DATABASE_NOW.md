# URGENT: Restore Your Database

## What Happened?
Your database was completely wiped. All tables are gone. This is why login doesn't work.

## Fix It Now (5 minutes)

### Step 1: Open Supabase SQL Editor
**https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new**

### Step 2: Run These 3 Migrations (in order)

#### Migration 1: Create Tradesperson Schema
1. Open file: `supabase/migrations/20251029073237_create_tradesperson_schema.sql`
2. Copy EVERYTHING in that file
3. Paste in Supabase SQL Editor
4. Click "Run" button
5. Wait for success message

#### Migration 2: Extend Schema
1. **Clear the SQL Editor first**
2. Open file: `supabase/migrations/20251031100345_extend_schema_for_full_platform.sql`
3. Copy EVERYTHING
4. Paste in SQL Editor
5. Click "Run"
6. Wait for success

#### Migration 3: Auth Fix
1. **Clear the SQL Editor**
2. Open file: `supabase/migrations/20251206000000_comprehensive_auth_fix.sql`
3. Copy EVERYTHING
4. Paste in SQL Editor
5. Click "Run"
6. Wait for success

### Step 3: Verify It Worked
```bash
node scripts/check-database-status.mjs
```

Should show:
```
✅ users: Ready
✅ artisans: Ready
✅ job_requests: Ready
```

### Step 4: Create Account & Login
1. Visit: http://localhost:5173
2. Click "Inscription"
3. Register new account
4. Login

## Common Errors (Ignore These)

- "already exists" - Good! Means it worked
- "does not exist" when dropping - Fine, just continue
- "duplicate policy" - Harmless

## Still Not Working?

Check these:
1. Did you run ALL 3 migrations?
2. Did you see "Success" for each one?
3. Do tables show up at: https://fldkqlardekarhibnyyx.supabase.co/project/_/editor

The database MUST be restored before anything will work.
