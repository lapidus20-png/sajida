# Notification System Implementation

## Overview
Implemented an automatic notification system that alerts artisans when new job requests matching their specialty are published.

## Database Schema

### Notifications Table
Created a new `notifications` table with the following structure:
- `id` (uuid, primary key)
- `user_id` (uuid, references users table)
- `type` ('info' | 'success' | 'warning' | 'error')
- `title` (text)
- `message` (text)
- `related_job_id` (uuid, optional reference to job_requests)
- `read` (boolean, default false)
- `created_at` (timestamptz)

## Automatic Notification Trigger

### Database Function: `notify_artisans_of_new_job()`
- Automatically runs when a job request is created or updated to 'publiee' status
- Matches artisan specialties (metier) to job categories
- Creates notifications for all matching artisans
- Handles both single and array metier fields
- Uses intelligent category mapping

### Category Mapping Logic
The system maps artisan professions to job categories:
- Électricien → Électricité
- Plombier → Plomberie
- Maçon → Maçonnerie
- Menuisier → Menuiserie
- Peintre → Peinture
- Carreleur → Carrelage
- Couvreur → Toiture
- Chauffagiste → Chauffage
- And more...

## Frontend Components

### NotificationList Component
**Location:** `src/components/NotificationList.tsx`

Features:
- Bell icon with unread count badge
- Dropdown notification panel
- Real-time updates (checks every 30 seconds)
- Mark individual notifications as read
- Mark all notifications as read
- Click notification to view related job
- Color-coded by type (info, success, warning, error)

### Integration
- Added to ArtisanDashboard header
- Clicking a notification:
  - Marks it as read
  - Switches to "Opportunités" tab
  - Scrolls to and highlights the job
  - Auto-removes highlight after 2 seconds

## Security (RLS Policies)

### Notifications Table Policies
1. **Users can view their own notifications**
   - Users can only read notifications where user_id matches their auth.uid()

2. **Users can update their own notifications**
   - Users can mark their own notifications as read

3. **System can insert notifications**
   - Allows the trigger to create notifications for all users

## Database Setup

Run this script to set up the notification system:

```bash
node scripts/create-notification-system.mjs
```

Or manually execute the SQL from the script in your Supabase SQL Editor.

## How It Works

1. **Client creates a job request** with status 'publiee'
2. **Database trigger fires** (`notify_artisans_of_new_job`)
3. **Trigger finds matching artisans** based on job category
4. **Notifications are created** for each matching artisan
5. **Artisans see bell icon** with unread count
6. **Artisan clicks notification** and is taken to the job

## Performance Optimizations

### Database Indexes
- `idx_notifications_user_id` - Fast lookup by user
- `idx_notifications_read` - Quick filtering of unread notifications
- `idx_notifications_created_at` - Efficient ordering by date

### Frontend
- Polls every 30 seconds to check for new notifications
- Limits to 20 most recent notifications
- Efficient re-renders using React state

## Testing

To test the notification system:

1. Create an artisan account with a specific metier (e.g., "Électricien")
2. Create a client account
3. As the client, create a job request with matching category (e.g., "Électricité")
4. Set status to 'publiee'
5. The artisan should immediately receive a notification

## Future Enhancements

Possible improvements:
- Real-time notifications using Supabase Realtime subscriptions
- Email notifications for important updates
- Notification preferences/settings
- Notification history archive
- Push notifications for mobile apps
