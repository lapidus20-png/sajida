# Migration: Métier to Multiple Trades Support

This guide explains how to update your database to support multiple trades per artisan.

## What Changed

The `metier` field in the `artisans` table has been changed from a single text field to an array of text values, allowing artisans to have multiple specialties.

### Before
```sql
metier text NOT NULL
```

### After
```sql
metier text[] NOT NULL
```

## How to Apply the Migration

### Step 1: Run the SQL Migration

Open your Supabase SQL Editor and run the migration file:

**File:** `update-metier-to-array.sql`

Or copy and paste this SQL:

```sql
-- Add a temporary column for the array
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS metier_array text[];

-- Migrate existing data - convert single metier to array
UPDATE artisans
SET metier_array = ARRAY[metier]
WHERE metier_array IS NULL;

-- Drop the old column
ALTER TABLE artisans DROP COLUMN metier;

-- Rename the new column to metier
ALTER TABLE artisans RENAME COLUMN metier_array TO metier;

-- Set default value for new records
ALTER TABLE artisans ALTER COLUMN metier SET DEFAULT ARRAY[]::text[];

-- Make it not null
ALTER TABLE artisans ALTER COLUMN metier SET NOT NULL;
```

### Step 2: Verify the Migration

After running the migration, verify it worked:

```sql
SELECT id, nom, prenom, metier FROM artisans LIMIT 5;
```

You should see the `metier` column now contains arrays like `{Plombier}` or `{Plombier,Électricien}`.

## UI Changes

### Artisan Dashboard - Profile Tab

When editing their profile, artisans can now:
- Add multiple trades/specialties
- Remove trades they no longer offer
- View all their trades as badges

**Edit Mode:**
- Input field to add new trades
- "Ajouter" button to add to the list
- X button on each badge to remove
- Validation ensures at least one trade is selected

**View Mode:**
- All trades displayed as emerald-colored badges
- Professional card-style layout

### Add Artisan Modal (Admin)

When adding a new artisan, admins can now:
- Select multiple trades from the dropdown
- Click "Ajouter" to add each selection
- Remove trades with the X button
- See all selected trades in a styled container
- Form validates that at least one trade is selected

### Artisan Cards (Main App)

Artisan cards now display all trades as a comma-separated list in amber color.

### Map View

Map markers and info windows display all trades joined with commas.

### Admin Dashboard

Pending artisan verification cards show all trades joined with commas.

## Data Safety

- All existing single metier values are automatically converted to single-item arrays
- No data is lost during migration
- Validation ensures artisans always have at least one trade

## Example Data

**Before Migration:**
```json
{
  "metier": "Plombier"
}
```

**After Migration:**
```json
{
  "metier": ["Plombier"]
}
```

**After Adding More Trades:**
```json
{
  "metier": ["Plombier", "Électricien", "Soudeur"]
}
```

## Rollback (if needed)

If you need to rollback to single metier:

```sql
-- Convert array back to single value (takes first item)
ALTER TABLE artisans ADD COLUMN metier_single text;
UPDATE artisans SET metier_single = metier[1];
ALTER TABLE artisans DROP COLUMN metier;
ALTER TABLE artisans RENAME COLUMN metier_single TO metier;
ALTER TABLE artisans ALTER COLUMN metier SET NOT NULL;
```

**Note:** This will lose any additional trades beyond the first one!

## Support

If you encounter any issues during migration, check:
1. Database permissions (ensure you have ALTER TABLE rights)
2. Existing data integrity (no NULL metier values)
3. RLS policies (they should continue to work without changes)
