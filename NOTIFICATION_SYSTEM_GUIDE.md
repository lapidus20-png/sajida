# Notification and Privacy System Guide

## Overview

The platform includes a comprehensive notification system with privacy controls that protect client information until payment is received.

## Key Features

### 1. Automatic Notifications

**When a message is sent:**
- Email notification sent to recipient
- SMS notification sent to recipient (if phone number provided)
- Notifications stored in database for tracking
- Real-time updates via Supabase subscriptions

### 2. Privacy Protection

**Client information is protected until 25% deposit is paid:**
- Email: `abc***@***.com` (masked)
- Phone: `0612****` (masked)
- Address: `*** Payez l'acompte pour voir ***` (hidden)
- City: Visible (not masked)

**After 25% payment:**
- All client contact information becomes visible
- Artisan can see full email, phone, and address
- Direct contact is enabled

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  type text CHECK (type IN ('message', 'payment', 'quote', 'contract', 'review', 'verification')),
  channel text CHECK (channel IN ('email', 'sms', 'both')),
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  status text CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  error_message text,
  metadata jsonb,
  created_at timestamptz
);
```

## Key Functions

### `has_paid_deposit(contract_id)`

Checks if 25% deposit has been paid for a contract.

```sql
SELECT has_paid_deposit('contract-uuid-here');
-- Returns: true or false
```

### `get_client_contact_info(client_id, requester_id, contract_id)`

Returns client contact information with privacy protection based on payment status.

```sql
SELECT get_client_contact_info(
  'client-uuid',
  'artisan-uuid',
  'contract-uuid'
);
-- Returns: {email, telephone, adresse, ville, masked: true/false}
```

### `notify_new_message()` (Trigger)

Automatically creates email and SMS notifications when a new message is sent.

## Usage in Components

### MessageCenter Component

```tsx
<MessageCenter
  userId={currentUserId}
  recipientId={artisanId}
  recipientName="John Doe"
  contractId={contractId}  // Required for privacy protection
  contextId={jobRequestId}
  contextType="job"
  onClose={() => setShowChat(false)}
/>
```

**Features:**
- Displays client contact info with privacy badge
- Shows masked/unmasked status
- Warning message when information is protected
- Toggleable contact info display

### NotificationList Component

```tsx
<NotificationList
  userId={currentUserId}
  onClose={() => setShowNotifications(false)}
/>
```

**Features:**
- Lists all user notifications
- Real-time updates
- Icon badges for notification type
- Status indicators (sent, failed)
- Channel indicators (email, SMS)

## Edge Function: send-notifications

Located at: `supabase/functions/send-notifications/index.ts`

### Endpoint
```
POST /functions/v1/send-notifications
```

### Request Body
```json
{
  "user_id": "uuid",
  "type": "message",
  "channel": "both",
  "recipient": "email@example.com",
  "subject": "Notification Subject",
  "message": "Notification message content",
  "metadata": {
    "message_id": "uuid",
    "sender_id": "uuid"
  }
}
```

### Response
```json
{
  "success": true,
  "results": [
    {
      "channel": "email",
      "recipient": "email@example.com",
      "status": "sent",
      "sent_at": "2024-12-14T10:00:00Z"
    },
    {
      "channel": "sms",
      "recipient": "+22512345678",
      "status": "sent",
      "sent_at": "2024-12-14T10:00:00Z"
    }
  ]
}
```

## Security & RLS Policies

### Notifications Table

1. **Users can view own notifications**
   - Users can only see their own notification records

2. **System can insert notifications**
   - Authenticated users can create notifications

3. **Admins have full access**
   - Admins can view and manage all notifications

## Payment Flow & Privacy

### Before Payment (0-24%)

```
Client Details Visible to Artisan:
✓ Name (from job request)
✓ City/Location
✓ Job description
✗ Email (masked)
✗ Phone (masked)
✗ Full address (hidden)
```

### After 25% Payment

```
Client Details Visible to Artisan:
✓ Name
✓ City/Location
✓ Job description
✓ Email (full)
✓ Phone (full)
✓ Full address
```

## Notification Types

1. **message** - New message received
2. **payment** - Payment received/completed
3. **quote** - Quote submitted/accepted
4. **contract** - Contract signed
5. **review** - Review submitted
6. **verification** - Profile verification status

## Testing the System

### Test Privacy Protection

1. Create a contract without payment
2. Open MessageCenter with contractId
3. Verify client info is masked
4. Create a transaction for 25%+ of contract
5. Reload MessageCenter
6. Verify client info is now visible

### Test Notifications

1. Send a message between users
2. Check notifications table for records
3. Verify email notification created
4. Verify SMS notification created (if phone exists)
5. Check NotificationList component for display

## Integration Checklist

- [ ] Database migration applied
- [ ] Edge function deployed
- [ ] MessageCenter updated with contractId prop
- [ ] NotificationList component added to main app
- [ ] Bell icon added to navigation for notifications
- [ ] Privacy protection tested with contracts
- [ ] Email/SMS sending configured (production)

## Production Configuration

For production, configure actual email/SMS services:

1. **Email Service**: SendGrid, AWS SES, or similar
2. **SMS Service**: Twilio, Africa's Talking, or similar
3. **Environment Variables**:
   - `EMAIL_SERVICE_API_KEY`
   - `SMS_SERVICE_API_KEY`
   - `SMS_SENDER_ID`

Update `send-notifications/index.ts` with actual service integrations.

## Best Practices

1. **Always pass contractId** to MessageCenter for privacy protection
2. **Check payment status** before revealing client details
3. **Monitor notification delivery** for failed sends
4. **Rate limit notifications** to prevent spam
5. **Log all notification attempts** for audit trail
6. **Test privacy controls** thoroughly before launch