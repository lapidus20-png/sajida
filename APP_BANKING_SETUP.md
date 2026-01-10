# App Banking Account Setup Guide

This guide explains how to set up and manage the platform's banking account where all payments will be transferred.

## Overview

The platform now includes a centralized banking account configuration system that allows administrators to:
- Configure the platform's banking details
- Set commission percentages on transactions
- Manage all payment-related settings from a single interface

## Setup Instructions

### 1. Create the Database Table

Run the migration to create the `app_settings` table:

```bash
npm run setup-app-settings
```

Or manually execute the SQL file in Supabase:
- Navigate to Supabase Dashboard > SQL Editor
- Open and run the contents of `add-app-settings.sql`

### 2. Access the Settings Page

1. Log in as an admin user
2. Navigate to the Admin Dashboard
3. Click on the "Paramètres" (Settings) tab
4. You'll see two main sections:
   - **Platform Banking Account**: Configure where payments are transferred
   - **Platform Commission**: Set the commission percentage

## Banking Account Configuration

### Required Information

Fill in the following banking details:

1. **Bank Name** (Nom de la banque)
   - Example: Banque Atlantique

2. **Account Holder** (Titulaire du compte)
   - The name of your company or platform

3. **Account Number** (Numéro de compte)
   - Your bank account number

4. **IBAN**
   - International Bank Account Number
   - Format: CI93 CI000 01234 56789 012345 67

5. **SWIFT/BIC Code**
   - Bank Identifier Code
   - Example: ATCICIXXX

6. **Currency** (Devise)
   - Options: XOF (Franc CFA), EUR, USD
   - Default: XOF

## Platform Commission

Configure how the platform collects commissions:

1. **Commission Percentage**
   - Enter a percentage (0-100%)
   - Default: 10%
   - This amount will be deducted from each transaction

2. **Enable Commission**
   - Toggle to enable or disable commission collection
   - When disabled, no commission is taken from transactions

## Using the Banking Account in Code

### Fetching Banking Account Details

```typescript
import { paymentService } from './lib/paymentService';

const bankingAccount = await paymentService.getBankingAccount();
console.log(bankingAccount);
// {
//   bank_name: 'Banque Atlantique',
//   account_holder: 'Your Company Name',
//   account_number: '1234567890',
//   iban: 'CI93 CI000 01234 56789 012345 67',
//   swift_bic: 'ATCICIXXX',
//   currency: 'XOF'
// }
```

### Calculating Commissions

```typescript
import { paymentService } from './lib/paymentService';

const commission = await paymentService.getCommissionSettings();
const amounts = paymentService.calculateAmounts(100000, commission);

console.log(amounts);
// {
//   totalAmount: 100000,
//   commissionAmount: 10000,  // 10% of 100000
//   netAmount: 90000          // Amount after commission
// }
```

### Clearing Cache

If you update settings and need to refresh them immediately:

```typescript
paymentService.clearCache();
const updatedAccount = await paymentService.getBankingAccount();
```

## Database Schema

The `app_settings` table stores configuration data:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| setting_key | text | Unique identifier (e.g., 'banking_account') |
| setting_value | jsonb | JSON object with setting data |
| description | text | Human-readable description |
| updated_at | timestamptz | Last update timestamp |
| updated_by | uuid | User who made the last update |

## Security

- Only users with `role = 'admin'` can read and modify settings
- Row Level Security (RLS) policies are enabled
- All settings changes are logged with timestamp and user ID

## Testing

To verify the setup:

1. Log in as admin
2. Go to Settings tab
3. Fill in the banking details
4. Click "Enregistrer les coordonnées bancaires"
5. Verify the data is saved by refreshing the page

## Troubleshooting

### Cannot see Settings tab
- Ensure you're logged in as an admin user
- Check that your user has `role = 'admin'` in the database

### Error saving settings
- Verify the `app_settings` table exists
- Check RLS policies are properly configured
- Ensure you're logged in with admin credentials

### Settings not appearing
- Run `npm run setup-app-settings` to create initial records
- Check browser console for errors
- Verify Supabase connection is working

## Payment Integration Flow

When a payment is processed:

1. User initiates payment
2. System fetches commission settings
3. Commission is calculated: `commission = amount * (percentage / 100)`
4. Payment is split:
   - Platform receives: commission amount → transferred to banking account
   - Artisan receives: net amount (total - commission)
5. Transaction is recorded with commission details

## Future Enhancements

Potential improvements:
- Multiple banking accounts (by currency or region)
- Dynamic commission rates based on transaction amount
- Automated bank transfers via API
- Payment reconciliation dashboard
- Commission history and analytics

## Support

For issues or questions:
- Check the Supabase dashboard for errors
- Review RLS policies in the database
- Verify admin user permissions
- Check browser console for JavaScript errors
