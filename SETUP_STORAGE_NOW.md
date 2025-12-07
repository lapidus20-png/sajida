# Set Up File Storage - 2 Minutes

Your database is ready, but file storage needs to be initialized.

## Quick Setup (Copy & Paste)

1. **Open Supabase SQL Editor:**
   https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new

2. **Open the file:** `setup-storage.sql` in Bolt

3. **Copy all the SQL** from `setup-storage.sql`

4. **Paste into SQL Editor** and click **"Run"**

That's it! This creates 4 storage buckets:

- **avatars** - Profile pictures (public)
- **portfolios** - Portfolio images (public)
- **documents** - Contracts & docs (private)
- **project-photos** - Project photos (restricted)

## After Running

Refresh your Bolt project settings to see the storage buckets appear.
