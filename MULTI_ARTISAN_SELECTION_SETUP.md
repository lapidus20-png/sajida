# Multi-Artisan Selection Setup Guide

## Overview

This feature allows clients to select up to 3 artisans for a single job. When artisans are selected, they automatically receive notifications.

## Database Setup Required

Before using this feature, you need to apply the database migration to create the necessary table.

### Step 1: Apply the Migration

Run the SQL file in your Supabase SQL Editor:

```bash
# The migration file is located at:
add-multi-artisan-selection.sql
```

Or copy and paste the contents of `add-multi-artisan-selection.sql` into your Supabase SQL Editor and execute it.

### What the Migration Does

1. **Creates `job_artisan_selections` table**
   - Tracks up to 3 artisans per job
   - Stores selection order (1st, 2nd, 3rd choice)
   - Links to job requests, artisans, and quotes

2. **Sets up Row Level Security (RLS)**
   - Anyone can view selections
   - Only job owners can create/delete selections
   - Properly secured with authentication checks

3. **Creates Notification Trigger**
   - Automatically sends notification to artisan when selected
   - Notification type: `job_assigned`
   - Includes job title and client message

## Features

### For Clients

1. **View Candidates**
   - Click "Voir candidats" button on any job with quotes
   - See all artisans who submitted quotes

2. **Multi-Selection**
   - Select up to 3 artisans by clicking on their cards
   - Selection order is tracked (1er choix, 2e choix, 3e choix)
   - Visual indicators show selection status
   - Selected artisans are highlighted with blue border

3. **Submit Selection**
   - Button text updates based on number selected
   - "Sélectionner cet artisan" (1 selected)
   - "Sélectionner ces 2 artisans" (2 selected)
   - "Sélectionner ces 3 artisans" (3 selected)

4. **View Selected Artisans**
   - Dashboard shows all selected artisans for each job
   - Displays selection order (1er choix, 2e choix, 3e choix)
   - Shows artisan photo and name

### For Artisans

1. **Automatic Notifications**
   - Receive instant notification when selected by a client
   - Notification includes:
     - Job title
     - Message to contact client
     - Link to job details

2. **View Selection Status**
   - Can see if they've been selected for a job
   - Know their selection order (primary, secondary, tertiary)

## How It Works

### Selection Process

1. Client views candidates who submitted quotes
2. Client clicks to select up to 3 artisans
3. Each selection is saved with order (1, 2, 3)
4. Notifications are automatically sent to selected artisans
5. Job status is updated to 'attribuee' (assigned)
6. First selected artisan is also set in `job_requests.selected_artisan_id`

### Technical Implementation

#### Database Structure

```sql
job_artisan_selections
├── id (uuid, primary key)
├── job_request_id (references job_requests)
├── artisan_id (references artisans)
├── quote_id (references quotes)
├── selection_order (integer, 1-3)
└── selected_at (timestamp)
```

#### Constraints

- Maximum 3 artisans per job
- Each artisan can only be selected once per job
- Selection order must be unique per job

#### Notifications

Automatic notification trigger creates notification with:
- Type: `job_assigned`
- Title: "Vous avez été sélectionné pour un projet"
- Message: Personalized with job title
- Linked to job request

## UI Components Updated

### SelectArtisanModal

- **Multi-selection mode**: Click to toggle selection
- **Visual feedback**: Blue border and badge for selected artisans
- **Selection counter**: Shows "X/3 sélectionnés"
- **Disabled state**: Can't select more than 3
- **Loading state**: Shows spinner during save
- **Order badges**: "1er choix", "2e choix", "3e choix"

### ClientDashboard

- **Selected artisans display**: Shows all selected artisans per job
- **Selection order**: Displays choice priority
- **Artisan cards**: Mini cards with photo and name
- **Auto-refresh**: Updates after selection

## Testing

To test the feature:

1. **Apply the migration** (see Step 1 above)
2. Create a job as a client
3. Submit quotes as different artisans
4. As client, click "Voir candidats"
5. Select 1-3 artisans
6. Click "Sélectionner"
7. Check:
   - ✓ Dashboard shows selected artisans
   - ✓ Artisans receive notifications
   - ✓ Job status is updated
   - ✓ Selection order is displayed correctly

## Notes

- The old `selected_artisan_id` column in `job_requests` is still maintained for backward compatibility
- It stores the first selected artisan
- The new system allows tracking multiple selections with priorities
- Notifications are handled automatically by database trigger
- No manual notification creation needed in application code

## Troubleshooting

### Artisans not receiving notifications

1. Check if `notifications` table exists
2. Verify artisan has `user_id` set in `artisans` table
3. Check trigger `trigger_notify_artisan_on_selection` exists
4. Verify function `notify_artisan_on_selection()` exists

### Can't select more than 3 artisans

This is by design - the feature limits selections to 3 artisans maximum.

### Database errors when selecting

1. Make sure migration is applied
2. Check RLS policies are enabled
3. Verify user is authenticated
4. Check user owns the job

## Future Enhancements

Possible improvements:
- Allow clients to reorder selections
- Add ability to remove individual selections
- Send follow-up notifications to secondary choices
- Add selection expiration dates
- Track which artisan accepted first
