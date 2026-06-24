# BuilderHub Supabase Database Schema

## Overview

This document describes the complete database schema for the BuilderHub platform - a service marketplace connecting artisans with clients in Burkina Faso.

---

## Core Tables

### `users`
**Authentication and profile data for all users**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | - | Primary key, references auth.users |
| `user_type` | text | NO | - | 'client', 'artisan', or 'admin' |
| `email` | text | NO | - | User email |
| `telephone` | text | YES | '' | Phone number |
| `adresse` | text | YES | '' | Address |
| `ville` | text | YES | '' | City |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `user_type IN ('client', 'artisan', 'admin')`

**RLS**: Enabled

---

### `artisans`
**Artisan profile data**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | YES | - | References users.id |
| `nom` | text | NO | - | Last name |
| `prenom` | text | NO | - | First name |
| `telephone` | text | NO | - | Phone (unique) |
| `email` | text | YES | '' | Email |
| `ville` | text | YES | '' | City |
| `quartier` | text | YES | '' | Neighborhood |
| `adresse` | text | YES | '' | Address |
| `metier` | text[] | NO | - | Array of trades/skills |
| `description` | text | YES | '' | Bio/description |
| `photo_url` | text | YES | '' | Profile photo URL |
| `annees_experience` | integer | YES | 0 | Years of experience |
| `tarif_horaire` | integer | YES | 0 | Hourly rate (XOF) |
| `disponible` | boolean | YES | true | Availability status |
| `note_moyenne` | numeric | YES | 0 | Average rating (0-5) |
| `statut_verification` | text | YES | 'en_attente' | 'en_attente', 'verifie', 'rejete' |
| `portefeuille` | text[] | YES | '{}' | Portfolio items |
| `certifications` | text[] | YES | '{}' | Certifications |
| `assurance_rcpro` | boolean | YES | false | Has liability insurance |
| `latitude` | numeric | YES | - | GPS latitude |
| `longitude` | numeric | YES | - | GPS longitude |
| `note_count` | integer | YES | 0 | Number of ratings |
| `selected_count` | integer | YES | 0 | Times selected for jobs |
| `categorie_ids` | text[] | YES | '{}' | Category IDs |
| `nombre_avis` | integer | YES | 0 | Number of reviews |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**RLS**: Enabled

---

### `services`
**Service requests (simpler model)**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `artisan_id` | uuid | YES | - | References artisans.id |
| `client_nom` | text | NO | - | Client name |
| `client_telephone` | text | NO | - | Client phone |
| `description` | text | NO | - | Service description |
| `adresse` | text | YES | '' | Location address |
| `date_souhaitee` | date | YES | - | Desired date |
| `statut` | text | YES | 'en_attente' | Status |
| `budget_estime` | integer | YES | 0 | Estimated budget (XOF) |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**RLS**: Enabled

---

### `avis`
**Reviews on services**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `artisan_id` | uuid | YES | - | References artisans.id |
| `service_id` | uuid | YES | - | References services.id |
| `client_nom` | text | NO | - | Client name |
| `note` | integer | NO | - | Rating (1-5) |
| `commentaire` | text | YES | '' | Comment |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Check constraint**: `note >= 1 AND note <= 5`

**RLS**: Enabled

---

## Job Request System

### `job_requests`
**Job postings from clients**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | - | References users.id |
| `titre` | text | NO | - | Job title |
| `description` | text | NO | - | Job description |
| `categorie` | text | NO | - | Job category |
| `localisation` | text | NO | - | Location |
| `ville` | text | YES | '' | City |
| `budget_min` | integer | YES | 0 | Minimum budget (XOF) |
| `budget_max` | integer | YES | 0 | Maximum budget (XOF) |
| `date_souhaitee` | date | YES | - | Desired start date |
| `date_limite_devis` | date | YES | - | Quote deadline |
| `statut` | text | YES | 'publiee' | Status |
| `images_url` | text[] | YES | '{}' | Image URLs |
| `latitude` | numeric | YES | - | GPS latitude |
| `longitude` | numeric | YES | - | GPS longitude |
| `categorie_id` | text | YES | '' | Category ID |
| `budget_initial` | integer | YES | 0 | Initial budget |
| `selected_artisan_id` | uuid | YES | - | Selected artisan |
| `selected_artisans` | uuid[] | YES | '{}' | Multiple selected artisans |
| `budget_unlocked` | boolean | YES | false | Budget visibility unlocked |
| `statut_brouillon` | boolean | YES | false | Is draft |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `statut IN ('brouillon', 'publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee')`

**RLS**: Enabled

---

### `quotes`
**Quotes from artisans for job requests**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `job_request_id` | uuid | NO | - | References job_requests.id |
| `artisan_id` | uuid | NO | - | References artisans.id |
| `montant_total` | integer | NO | - | Total amount (XOF) |
| `montant_acompte` | integer | YES | 0 | Deposit amount (XOF) |
| `delai_execution` | integer | NO | - | Execution time (days) |
| `description_travaux` | text | NO | - | Work description |
| `materiel_fourni` | text[] | YES | '{}' | Materials provided |
| `conditions_paiement` | text | YES | '' | Payment terms |
| `statut` | text | YES | 'en_attente' | Status |
| `validite_jusqu_au` | date | YES | - | Valid until date |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `statut IN ('en_attente', 'accepte', 'refuse', 'expire')`

**RLS**: Enabled

---

### `contracts`
**Contracts between clients and artisans**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `job_request_id` | uuid | NO | - | References job_requests.id |
| `quote_id` | uuid | NO | - | References quotes.id |
| `client_id` | uuid | NO | - | References users.id |
| `artisan_id` | uuid | NO | - | References artisans.id |
| `montant_total` | integer | NO | - | Total amount (XOF) |
| `acompte` | integer | NO | - | Deposit (XOF) |
| `reste_du` | integer | NO | - | Remaining amount (XOF) |
| `date_debut` | date | NO | - | Start date |
| `date_fin_prevue` | date | NO | - | Expected end date |
| `conditions_generales` | text | NO | - | General terms |
| `signe_client` | boolean | YES | false | Client signed |
| `signe_artisan` | boolean | YES | false | Artisan signed |
| `date_signature_client` | timestamptz | YES | - | Client signature date |
| `date_signature_artisan` | timestamptz | YES | - | Artisan signature date |
| `statut` | text | YES | 'en_cours' | Status |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `statut IN ('en_cours', 'termine', 'resilie')`

**RLS**: Enabled

---

### `project_timeline`
**Project milestones tracking**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `contract_id` | uuid | NO | - | References contracts.id |
| `jalon_numero` | integer | NO | - | Milestone number |
| `titre` | text | NO | - | Milestone title |
| `description` | text | NO | - | Description |
| `date_prevue` | date | NO | - | Expected date |
| `date_completion` | date | YES | - | Completion date |
| `pourcentage_travail` | integer | YES | 0 | Work percentage |
| `montant_associe` | integer | YES | 0 | Associated amount (XOF) |
| `statut` | text | YES | 'en_attente' | Status |
| `photos_url` | text[] | YES | '{}' | Photo URLs |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `pourcentage_travail >= 0 AND pourcentage_travail <= 100`
**Check constraint**: `statut IN ('en_attente', 'en_cours', 'complete', 'repousse')`

**RLS**: Enabled

---

## Messaging

### `messages`
**Messages between users**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `job_request_id` | uuid | YES | - | References job_requests.id |
| `quote_id` | uuid | YES | - | References quotes.id |
| `sender_id` | uuid | NO | - | References users.id |
| `recipient_id` | uuid | NO | - | References users.id |
| `contenu` | text | NO | - | Message content |
| `pieces_jointes` | text[] | YES | '{}' | Attachments |
| `lu` | boolean | YES | false | Read status |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**RLS**: Enabled

---

## Reviews System

### `reviews`
**Verified reviews and ratings**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `contract_id` | uuid | NO | - | References contracts.id |
| `reviewer_id` | uuid | NO | - | References users.id |
| `reviewed_user_id` | uuid | NO | - | References users.id |
| `note` | integer | NO | - | Rating (1-5) |
| `commentaire` | text | YES | '' | Comment |
| `verification_code` | text | YES | - | Unique verification code |
| `verified` | boolean | YES | false | Verified status |
| `utile_count` | integer | YES | 0 | Helpful count |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `note >= 1 AND note <= 5`
**Unique constraint**: `verification_code`

**RLS**: Enabled

---

## Payment System

### `payment_methods`
**User payment methods**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References users.id |
| `method_type` | text | NO | - | 'mobile_money', 'bank_card', 'cash' |
| `provider` | text | NO | - | Provider name |
| `display_name` | text | NO | - | Display name |
| `last_four` | text | YES | - | Last 4 digits |
| `phone_number` | text | YES | - | Phone for mobile money |
| `is_default` | boolean | YES | false | Default method |
| `is_verified` | boolean | YES | false | Verified status |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `method_type IN ('mobile_money', 'bank_card', 'cash')`
**Check constraint**: `provider IN ('orange_money', 'moov_money', 'wave', 'telecel_money', 'visa', 'mastercard', 'cash')`

**RLS**: Enabled

---

### `transactions`
**Payment transactions**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `contract_id` | uuid | YES | - | References contracts.id |
| `payer_id` | uuid | NO | - | Payer user ID |
| `receiver_id` | uuid | NO | - | Receiver user ID |
| `payment_method_id` | uuid | YES | - | References payment_methods.id |
| `amount` | numeric | NO | - | Amount (XOF) |
| `transaction_type` | text | NO | - | Type |
| `status` | text | NO | 'en_attente' | Status |
| `provider_transaction_id` | text | YES | - | Provider transaction ID |
| `provider_reference` | text | YES | - | Provider reference |
| `failure_reason` | text | YES | - | Failure reason |
| `metadata` | jsonb | YES | '{}' | Additional metadata |
| `processed_at` | timestamptz | YES | - | Processing timestamp |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `amount > 0`
**Check constraint**: `transaction_type IN ('acompte', 'paiement_partiel', 'solde', 'remboursement')`
**Check constraint**: `status IN ('en_attente', 'traitement', 'complete', 'echoue', 'annule', 'rembourse')`

**RLS**: Enabled

---

### `escrow_accounts`
**Escrow accounts for deposits**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `contract_id` | uuid | NO | - | References contracts.id (unique) |
| `total_amount` | numeric | NO | - | Total amount (XOF) |
| `amount_deposited` | numeric | YES | 0 | Deposited amount |
| `amount_released` | numeric | YES | 0 | Released amount |
| `amount_held` | numeric | - | GENERATED | Held amount (deposited - released) |
| `status` | text | NO | 'ouvert' | Status |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `status IN ('ouvert', 'finance', 'en_cours', 'termine', 'dispute', 'cloture')`

**RLS**: Enabled

---

### `payment_schedules`
**Payment schedules by milestone**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `contract_id` | uuid | NO | - | References contracts.id |
| `milestone_number` | integer | NO | - | Milestone number |
| `description` | text | NO | - | Description |
| `amount` | numeric | NO | - | Amount (XOF) |
| `due_date` | date | YES | - | Due date |
| `status` | text | NO | 'en_attente' | Status |
| `paid_at` | timestamptz | YES | - | Payment timestamp |
| `transaction_id` | uuid | YES | - | References transactions.id |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**Check constraint**: `amount > 0`
**Check constraint**: `status IN ('en_attente', 'paye', 'en_retard', 'annule')`
**Unique constraint**: `(contract_id, milestone_number)`

**RLS**: Enabled

---

## Wallet System

### `wallet_accounts`
**User wallet accounts**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References users.id (unique) |
| `balance` | integer | NO | 0 | Current balance (XOF) |
| `currency` | text | YES | 'XOF' | Currency |
| `created_at` | timestamptz | YES | now() | Creation timestamp |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**RLS**: Enabled

---

### `wallet_transactions`
**Wallet transaction history**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `wallet_id` | uuid | NO | - | References wallet_accounts.id |
| `type` | text | NO | - | 'credit', 'debit', 'refund' |
| `amount` | integer | NO | - | Amount (XOF) |
| `description` | text | YES | '' | Description |
| `reference` | text | YES | '' | Reference |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Check constraint**: `type IN ('credit', 'debit', 'refund')`

**RLS**: Enabled

---

## Contact Unlock System

### `contact_unlocks`
**Track contact info unlocks**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | - | References users.id |
| `artisan_id` | uuid | NO | - | References artisans.id |
| `job_request_id` | uuid | YES | - | References job_requests.id |
| `amount_paid` | integer | YES | 0 | Amount paid to unlock |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**RLS**: Enabled

---

## Notifications

### `notifications`
**User notifications**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | References users.id |
| `type` | text | NO | 'info' | Notification type |
| `title` | text | NO | '' | Title |
| `message` | text | NO | '' | Message |
| `data` | jsonb | YES | '{}' | Additional data |
| `read` | boolean | YES | false | Read status |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**RLS**: Enabled

---

## Saved Jobs

### `saved_jobs`
**Artisan saved/bookmarked jobs**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `artisan_id` | uuid | NO | - | References artisans.id |
| `job_request_id` | uuid | NO | - | References job_requests.id |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**Unique constraint**: `(artisan_id, job_request_id)`

**RLS**: Enabled

---

## Client Documents

### `client_documents`
**Client uploaded documents**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `client_id` | uuid | NO | - | References users.id |
| `job_request_id` | uuid | YES | - | References job_requests.id |
| `nom` | text | NO | '' | Document name |
| `type` | text | NO | 'document' | Document type |
| `url` | text | NO | '' | Document URL |
| `taille` | integer | YES | 0 | File size (bytes) |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**RLS**: Enabled

---

## Admin

### `admin_logs`
**Admin activity logs**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `admin_id` | uuid | YES | - | References users.id |
| `action` | text | NO | - | Action performed |
| `table_name` | text | YES | - | Affected table |
| `record_id` | uuid | YES | - | Affected record ID |
| `ancienne_valeur` | jsonb | YES | - | Old value |
| `nouvelle_valeur` | jsonb | YES | - | New value |
| `created_at` | timestamptz | YES | now() | Creation timestamp |

**RLS**: Enabled

---

### `app_settings`
**Application settings**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `key` | text | NO | - | Setting key (unique) |
| `value` | jsonb | NO | '{}' | Setting value |
| `description` | text | YES | '' | Description |
| `updated_at` | timestamptz | YES | now() | Update timestamp |

**RLS**: Enabled

---

## Additional Tables

### `jobs`
**Alternative simplified job model**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `client_id` | uuid | YES | - | References users.id |
| `title` | text | NO | - | Job title |
| `description` | text | YES | - | Description |
| `budget` | numeric | YES | - | Budget |
| `status` | text | YES | 'open' | Status |
| `artisan_id` | uuid | YES | - | References artisans.id |
| `latitude` | numeric | YES | - | GPS latitude |
| `longitude` | numeric | YES | - | GPS longitude |
| `created_at` | timestamp | YES | now() | Creation timestamp |

**RLS**: Enabled

---

### `chat_messages`
**Chat messages for jobs**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key |
| `job_id` | uuid | YES | - | References jobs.id |
| `sender_id` | uuid | YES | - | References users.id |
| `content` | text | NO | - | Message content |
| `created_at` | timestamp | YES | now() | Creation timestamp |

**RLS**: Enabled

---

## Database Functions

### `calculate_distance(lat1, lon1, lat2, lon2)`
Calculates distance between two GPS coordinates using Haversine formula.
- **Returns**: `numeric` - Distance in kilometers

### `calculate_platform_fee(amount)`
Calculates the platform fee (5% commission).
- **Returns**: `numeric` - Fee amount

### `can_view_contact_info(viewer_id, target_user_id, contract_id)`
Checks if a user can view another user's contact information.
- **Returns**: `boolean`

### `mask_phone(phone_number)`
Masks a phone number for privacy.
- **Returns**: `text` - Masked phone (e.g., "+226XXXXXX56")

### `mask_email(email_address)`
Masks an email address for privacy.
- **Returns**: `text` - Masked email (e.g., "j***n@e***.com")

### `recharge_wallet(artisan_id, amount, reference)`
Recharges an artisan's wallet.
- **Returns**: `jsonb` - Result with success status and new balance

### `debit_wallet(artisan_id, amount, job_id, description)`
Debits an artisan's wallet for job applications.
- **Returns**: `jsonb` - Result with success status and new balance

---

## Indexes

Key indexes for performance:
- `idx_artisans_metier` - Artisan trade lookup
- `idx_artisans_ville` - City-based searches
- `idx_artisans_location` - GPS coordinate queries
- `idx_job_requests_client` - Client's job requests
- `idx_job_requests_statut` - Status filtering
- `idx_job_requests_categorie` - Category filtering
- `idx_quotes_job_request` - Quotes for a job
- `idx_quotes_artisan` - Artisan's quotes
- `idx_contracts_client` - Client's contracts
- `idx_contracts_artisan` - Artisan's contracts
- `idx_transactions_contract` - Contract transactions
- `idx_messages_sender` - Sent messages
- `idx_messages_recipient` - Received messages
- `idx_notifications_user` - User notifications

---

## Security (RLS)

All tables have Row Level Security (RLS) enabled with policies that enforce:
- Users can only view their own data unless explicitly permitted
- Artisans can only modify their own profiles and quotes
- Clients can only modify their own job requests
- Admins have elevated access for moderation
- Contact information is protected until payment/contract

---

## Entity Relationship Summary

```
auth.users
    └── public.users (1:1, id shared)
            ├── artisans (user_id)
            │      ├── services (artisan_id)
            │      ├── avis (artisan_id)
            │      ├── quotes (artisan_id)
            │      ├── contracts (artisan_id)
            │      ├── saved_jobs (artisan_id)
            │      └── contact_unlocks (artisan_id)
            │
            ├── job_requests (client_id)
            │      ├── quotes (job_request_id)
            │      ├── contracts (job_request_id)
            │      ├── messages (job_request_id)
            │      ├── client_documents (job_request_id)
            │      ├── saved_jobs (job_request_id)
            │      └── contact_unlocks (job_request_id)
            │
            ├── contracts (client_id)
            │      ├── project_timeline (contract_id)
            │      ├── reviews (contract_id)
            │      ├── transactions (contract_id)
            │      ├── escrow_accounts (contract_id)
            │      └── payment_schedules (contract_id)
            │
            ├── messages (sender_id, recipient_id)
            ├── reviews (reviewer_id, reviewed_user_id)
            ├── notifications (user_id)
            ├── wallet_accounts (user_id)
            │      └── wallet_transactions (wallet_id)
            ├── payment_methods (user_id)
            ├── client_documents (client_id)
            └── admin_logs (admin_id)
```
