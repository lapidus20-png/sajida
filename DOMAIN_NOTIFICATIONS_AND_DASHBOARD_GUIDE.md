# Domain-Based Notifications & Dashboard Reorganization Guide

## Overview

The platform now includes domain-specific job notifications and a reorganized artisan dashboard with clear separation between account management and saved opportunities.

## Key Features

### 1. Domain-Based Job Notifications

**Artisans only receive notifications for jobs matching their specialty:**

- Electricians receive only electrical job notifications
- Plumbers receive only plumbing job notifications
- Each trade receives only relevant opportunities

**How it works:**
- Job requests have a `categorie` field
- Artisans have a `metier` field
- Notifications are sent only when `categorie` matches `metier`
- Only verified artisans receive notifications

**Notification Channels:**
- Email: Detailed job information
- SMS: Quick alert with job title and location

### 2. Reorganized Artisan Dashboard

**New tab structure:**

1. **Opportunités** - Browse available jobs matching your specialty
2. **Mes devis** - View your submitted quotes
3. **Opportunités sauvegardées** - Saved jobs for later review
4. **Mon profil** - Manage your professional profile
5. **Gérer mon compte** - Manage account settings (formerly "Mon compte")

**Key improvements:**
- Clear separation between profile and account management
- Dedicated saved leads section
- Visual filtering indicators
- Save/unsave functionality for job opportunities

## Database Schema

### Saved Jobs Table

```sql
CREATE TABLE saved_jobs (
  id uuid PRIMARY KEY,
  artisan_id uuid REFERENCES artisans(id),
  job_request_id uuid REFERENCES job_requests(id),
  created_at timestamptz,
  UNIQUE(artisan_id, job_request_id)
);
```

### Notification Types

Updated to include `job_opportunity`:
```sql
type IN ('message', 'payment', 'quote', 'contract', 'review', 'verification', 'job_opportunity')
```

## Key Functions

### `notify_artisans_of_new_job()`

Triggered when new job is posted with status `publiee`.

**What it does:**
1. Gets the job category
2. Finds all verified artisans matching that category
3. Creates email notification for each matching artisan
4. Creates SMS notification if phone number exists

**Example:**
```sql
-- When a new electrical job is posted
INSERT INTO job_requests (titre, categorie, ...)
VALUES ('Electrical Wiring', 'Électricien', ...);

-- Automatically notifies all verified electricians
```

## Artisan Dashboard Features

### Job Opportunities Tab

**Features:**
- Shows only jobs matching artisan's specialty (metier)
- Displays filtering badge showing specialty
- Save button for each job (bookmark icon)
- Distance indicator from artisan location
- Quick respond button to create quote

**UI Elements:**
```
┌─────────────────────────────────────┐
│ Filtré par métier: Électricien     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Job Title              📍 3 km      │
│ Description...                      │
│ 📍 Location | 💰 Budget | 📅 Date   │
│                  [🔖] [Répondre]    │
└─────────────────────────────────────┘
```

### Saved Leads Tab

**Features:**
- Shows all saved job opportunities
- Yellow highlight for saved jobs
- Remove button to unsave
- Quick respond button
- Badge showing count in tab

**UI Elements:**
```
┌─────────────────────────────────────┐
│ 🔖 Job Title           📍 3 km      │
│ Description...                      │
│ 📍 Location | 💰 Budget | 📅 Date   │
│                  [🗑️] [Répondre]    │
└─────────────────────────────────────┘
```

### Account Management Tab

**Renamed to "Gérer mon compte"** with Settings icon

**Sections:**
- Personal information
- Change password
- Account type display

**Clear distinction:**
- **Mon profil**: Professional info (portfolio, certifications, experience)
- **Gérer mon compte**: Personal account settings (email, phone, password)

## Notification Flow

### When Client Posts New Job

```
1. Client creates job request with category
   └─ categorie: "Électricien"

2. Trigger: notify_artisans_of_new_job()
   ├─ Find verified artisans WHERE metier = "Électricien"
   ├─ For each matching artisan:
   │   ├─ Create email notification
   │   │   └─ "Nouvelle opportunité: [Job Title]"
   │   └─ Create SMS notification (if phone exists)
   │       └─ "Nouvelle opportunité Électricien: [Title]"
   └─ Notifications stored with status: 'pending'

3. Artisan logs in
   ├─ Sees notification badge
   ├─ Views filtered opportunities
   └─ Can save or respond to jobs
```

## Usage Examples

### Save a Job Opportunity

```typescript
// In ArtisanDashboard component
const handleSaveJob = async (jobId: string) => {
  await supabase.from('saved_jobs').insert({
    artisan_id: artisanId,
    job_request_id: jobId
  });
};
```

### Load Saved Jobs

```typescript
const { data } = await supabase
  .from('saved_jobs')
  .select('job_request_id')
  .eq('artisan_id', artisanId);
```

### Filter Jobs by Specialty

```typescript
const { data } = await supabase
  .from('job_requests')
  .select('*')
  .eq('statut', 'publiee')
  .eq('categorie', artisan.metier);  // Only matching jobs
```

## Migration Instructions

### Apply Database Migration

The migration file `domain_based_job_notifications.sql` needs to be applied to create:
- `saved_jobs` table
- `notify_artisans_of_new_job()` function
- Trigger on `job_requests`
- Updated notification types

**Manual Application (if MCP tool unavailable):**
```bash
# Connect to your Supabase database and run:
# /project/supabase/migrations/domain_based_job_notifications.sql
```

## Benefits

### For Artisans

1. **Reduced Noise**: Only receive relevant job notifications
2. **Better Organization**: Save interesting jobs for later
3. **Clear Navigation**: Know exactly where to find account vs profile settings
4. **Efficiency**: Quickly identify matching opportunities

### For Clients

1. **Targeted Reach**: Jobs reach only relevant artisans
2. **Higher Response Rate**: Artisans respond to relevant opportunities
3. **Better Matches**: Connect with specialized professionals

## Testing Checklist

- [ ] Create job request as client with specific category
- [ ] Verify only matching artisans receive notifications
- [ ] Test saving job opportunity
- [ ] Test unsaving job opportunity
- [ ] Verify saved jobs appear in "Opportunités sauvegardées" tab
- [ ] Confirm filtering message shows correct specialty
- [ ] Test bookmark icon toggle
- [ ] Verify "Gérer mon compte" tab shows account settings
- [ ] Verify "Mon profil" tab shows professional info

## Common Job Categories / Métiers

Match these values between `job_requests.categorie` and `artisans.metier`:

- Électricien
- Plombier
- Maçon
- Menuisier
- Peintre
- Carreleur
- Couvreur
- Chauffagiste
- Serrurier
- Jardinier

## Troubleshooting

### Artisan Not Receiving Notifications

**Check:**
1. Artisan `statut_verification` is `'verifie'`
2. Artisan `metier` exactly matches job `categorie` (case-sensitive)
3. Job `statut` is `'publiee'`
4. Notifications table shows records with status `'pending'`

### No Jobs Showing in Opportunities

**Check:**
1. Job requests exist with matching `categorie`
2. Jobs have `statut = 'publiee'`
3. Artisan `metier` field is set correctly
4. Database query includes category filter

### Saved Jobs Not Persisting

**Check:**
1. `saved_jobs` table exists and has RLS policies
2. Artisan ID is correct
3. No duplicate constraint violations
4. User is authenticated

## Future Enhancements

Potential improvements:
- Multi-specialty support for artisans
- Notification preferences (email/SMS toggle)
- Job alert frequency settings
- Category recommendations based on profile
- Smart job matching algorithm
- Push notifications for mobile app