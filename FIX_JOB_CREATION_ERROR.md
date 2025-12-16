# Fix Job Creation Error

## Problem
Clients cannot create job requests. The error is: `new row for relation "job_requests" violates check constraint "job_requests_statut_check"`

## Cause
The job creation form sets the status to `'brouillon'` (draft), but the database check constraint doesn't allow this value. The constraint only allows: `'publiee'`, `'en_negociation'`, `'attribuee'`, `'en_cours'`, `'terminee'`, `'annulee'`.

## Solution
Run the following SQL in your Supabase SQL Editor:

```sql
ALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_statut_check;

ALTER TABLE job_requests
  ADD CONSTRAINT job_requests_statut_check
  CHECK (statut IN ('brouillon', 'publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee'));
```

## Steps
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Paste the SQL above
4. Click "Run"
5. Test creating a job request in your application

## What This Does
- Removes the old constraint that blocked 'brouillon' status
- Adds a new constraint that includes 'brouillon' in the allowed values
- Allows clients to save draft job requests before publishing them
