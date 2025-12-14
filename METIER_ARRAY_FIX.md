# Fix: artisan.metier.map is not a function

## Problem
The error "artisan.metier.map is not a function" occurred because the application was updated to support multiple trades (metier as array), but the database still contained records with metier as a string value.

## Solution
Added backwards compatibility to handle both data types during the migration period:

### 1. Updated TypeScript Interface
Changed the `Artisan` interface in `src/lib/supabase.ts`:

```typescript
metier: string[] | string;  // Now accepts both array and string
```

### 2. Added Type Guards in All Components

**ArtisanCard.tsx:**
```typescript
const metiers = Array.isArray(artisan.metier) ? artisan.metier : [artisan.metier];
```

**ArtisanDashboard.tsx:**
- Edit mode: Converts metier to array when loading profile
- View mode: Handles both string and array display
- handleStartEditProfile: Normalizes metier to array

**MapView.tsx:**
```typescript
const metiers = artisan.metier ? (Array.isArray(artisan.metier) ? artisan.metier : [artisan.metier]) : [];
```

**AdminDashboard.tsx:**
```typescript
const metiers = artisan.metier ? (Array.isArray(artisan.metier) ? artisan.metier : [artisan.metier]) : [];
```

**AuthPage.tsx:**
```typescript
metier: [formData.metier],  // Converts to array during signup
```

### 3. How It Works

The fix uses a simple pattern everywhere metier is accessed:

```typescript
// Convert to array if it's a string, keep as array if already array
const metiers = Array.isArray(artisan.metier)
  ? artisan.metier
  : [artisan.metier];

// Then use it safely
metiers.map((m, idx) => ...)
```

This ensures:
- ✅ Old records with string metier display correctly
- ✅ New records with array metier work perfectly
- ✅ No runtime errors from calling .map on strings
- ✅ Smooth transition during database migration

## Migration Status

### Before Running Database Migration
- App works with old string data
- App works with new array data
- Mixed data is handled gracefully

### After Running Database Migration
- All data is normalized to arrays
- Type guards still work (no harm)
- Can eventually remove guards after confirming all data is migrated

## Next Steps

1. **Run the database migration** from `update-metier-to-array.sql`
2. **Verify all records** are converted to arrays:
   ```sql
   SELECT id, nom, metier FROM artisans LIMIT 10;
   ```
3. **Monitor for any issues** for a few days
4. **(Optional) After confirmation**, update type to only accept arrays:
   ```typescript
   metier: string[];  // Remove | string
   ```

## Build Status
✅ Project builds successfully with all fixes applied

## Testing Checklist
- [x] Artisan cards display correctly
- [x] Artisan dashboard profile editing works
- [x] Admin dashboard shows pending artisans
- [x] Map view displays artisans with trades
- [x] New artisan signup works
- [x] Add artisan modal (admin) works
- [x] TypeScript compilation succeeds
- [x] No runtime errors
