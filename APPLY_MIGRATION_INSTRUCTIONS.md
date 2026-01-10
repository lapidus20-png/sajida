# How to Apply the Artisan Selection Migration

The artisan selection feature is ready to use! You just need to apply the database migration.

## Quick Steps

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy all the SQL from `APPLY_MIGRATION.sql`
6. Paste it into the SQL Editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. You should see "Success. No rows returned"

### Option 2: Command Line (if you have database access)

```bash
# If you have the database connection string
psql "your-connection-string" -f APPLY_MIGRATION.sql
```

## What Gets Added

The migration adds:
- ✅ `selected_artisan_id` column - tracks which artisan was chosen
- ✅ `closed_at` column - records when the job was closed
- ✅ Performance indexes
- ✅ Auto-trigger to update status when artisan is selected

## Verify It Worked

After running the migration, run this query to verify:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'job_requests'
AND column_name IN ('selected_artisan_id', 'closed_at');
```

You should see both columns listed.

## After Migration

The feature will work automatically:

1. Clients can see how many artisans applied to each job
2. Click "Voir candidats" to view all applicants
3. Select an artisan to close the job
4. Job status automatically changes to "Attribuée"
5. The selected artisan's quote is marked as "Accepté"

---

**Need Help?**
If you encounter any issues:
- Check the SQL syntax in the editor
- Make sure you're using the service_role key (admin access)
- Contact Supabase support if you get permission errors
