# Wallet System Setup Guide

## Overview

The wallet system allows artisans to:
- Recharge their wallet with money
- Pay application fees when applying for jobs (1,000 FCFA per application)
- View their balance and transaction history

## Setup Instructions

### Step 1: Create Database Tables

1. Go to your Supabase SQL Editor:
   **https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new**

2. Copy the ENTIRE content from `wallet-system.sql` file

3. Paste it into the SQL Editor

4. Click "Run" button

5. Wait for "Success" message

### Step 2: Verify Tables Created

Go to your Supabase Table Editor to verify these tables exist:
- `wallet_balances` - Stores each artisan's wallet balance
- `wallet_transactions` - Stores all transaction history

### Step 3: Test the Wallet System

1. Start your dev server (if not already running)

2. Login as an artisan

3. Click on the new **"Portefeuille"** tab

4. You should see:
   - Current balance (0 FCFA initially)
   - "Recharger" button
   - Transaction history (empty initially)

### Step 4: Test Wallet Recharge

1. Click the "Recharger" button

2. Select an amount (e.g., 5,000 FCFA)

3. Choose payment method (Mobile Money or Card)

4. Enter phone number (if Mobile Money)

5. Click "Recharger"

6. After 2 seconds, your wallet should be credited

7. Check the transaction history

### Step 5: Test Job Application with Wallet

1. Go to "Opportunités" tab

2. Find a job you want to apply for

3. Click "Répondre (1 000 FCFA)" button

4. If you have sufficient balance:
   - 1,000 FCFA will be deducted automatically
   - Quote form will open
   - Transaction will be recorded

5. If insufficient balance:
   - You'll see an alert with your current balance
   - Option to recharge your wallet

## Features

### Artisan Wallet Dashboard
- **Balance Card**: Shows current balance with gradient design
- **Total Statistics**: Total recharged and total spent
- **Recharge Button**: Quick access to add funds
- **Transaction History**: Complete list of all transactions with icons and details

### Recharge Modal
- **Preset Amounts**: Quick select 1k, 2k, 5k, 10k, 20k, 50k FCFA
- **Custom Amount**: Enter any amount (min 500 FCFA)
- **Payment Methods**:
  - Mobile Money (Orange, Moov, etc.)
  - Card (Visa, Mastercard)
- **Summary**: Shows amount, fees, and new balance

### Job Application Fees
- **Fee per Application**: 1,000 FCFA
- **Automatic Deduction**: Fee deducted when clicking "Répondre"
- **Balance Check**: Prevents application if insufficient funds
- **Transaction Recording**: All fees recorded in history

## Database Schema

### wallet_balances Table
```sql
- artisan_id (uuid, primary key)
- balance (integer) - Current balance in FCFA
- total_recharged (integer) - Lifetime total recharged
- total_spent (integer) - Lifetime total spent
- created_at (timestamptz)
- updated_at (timestamptz)
```

### wallet_transactions Table
```sql
- id (uuid, primary key)
- artisan_id (uuid, foreign key)
- type (text) - 'recharge', 'debit', 'refund'
- amount (integer) - Amount in FCFA
- balance_after (integer) - Balance after transaction
- description (text) - Transaction description
- reference (text) - Payment reference
- related_job_id (uuid) - Job request ID if applicable
- status (text) - 'pending', 'completed', 'failed'
- created_at (timestamptz)
```

## Database Functions

### recharge_wallet(artisan_id, amount, reference)
Credits the artisan's wallet and records the transaction.

### debit_wallet(artisan_id, amount, job_id, description)
Debits the artisan's wallet (for job applications) and records the transaction.
Checks for sufficient balance before debiting.

### initialize_artisan_wallet()
Automatically creates a wallet when a new artisan registers.

## Security (RLS Policies)

- Artisans can only view their own wallet balance
- Artisans can only view their own transactions
- All wallet operations use secure database functions
- Balance validation prevents negative balances

## Troubleshooting

### "Table does not exist" Error
Run the SQL from `wallet-system.sql` in Supabase SQL Editor.

### Wallet Not Showing
Make sure you're logged in as an artisan (not client or admin).

### Recharge Not Working
Check browser console for errors. The recharge currently simulates payment processing.

### Transaction Not Recorded
Check that database functions were created successfully by running:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('recharge_wallet', 'debit_wallet', 'initialize_artisan_wallet');
```

## Next Steps

To integrate real payment processing:
1. Add payment gateway integration (Orange Money, Moov Money, etc.)
2. Update `WalletRecharge.tsx` to call real payment API
3. Add webhook handler for payment confirmation
4. Update transaction status based on payment result

## Constants

- **Application Fee**: 1,000 FCFA (defined in `walletService.ts`)
- **Minimum Recharge**: 500 FCFA
- **Preset Amounts**: 1k, 2k, 5k, 10k, 20k, 50k FCFA

## Files Added/Modified

### New Files
- `src/lib/walletService.ts` - Wallet operations service
- `src/components/WalletRecharge.tsx` - Recharge modal component
- `wallet-system.sql` - Database migration script
- `WALLET_SYSTEM_SETUP.md` - This file

### Modified Files
- `src/components/ArtisanDashboard.tsx` - Added wallet tab and fee deduction logic

---

**Ready to use!** After running the SQL migration, artisans can start using the wallet system immediately.
