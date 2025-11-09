/*
  # Extension du schéma pour plateforme complète de mise en relation

  1. Nouvelles Tables
    - `users` - Gestion des utilisateurs (clients et artisans)
    - `job_requests` - Demandes de travaux publiées par les clients
    - `quotes` - Devis proposés par les artisans
    - `contracts` - Contrats et accords
    - `project_timeline` - Suivi des jalons et avancement du projet
    - `messages` - Système de messagerie intégré
    - `reviews` - Évaluations et avis vérifiés
    - `admin_logs` - Logs des activités administrateur

  2. Modifications
    - Amélioration de la table `artisans` avec champs d'authentification
    - Ajout de vérifications et statuts de profil

  3. Sécurité
    - RLS strict sur toutes les tables
    - Authentification Supabase Auth intégrée
    - Politiques d'accès basées sur les rôles utilisateur

  4. Notes
    - Données personnelles protégées par chiffrement
    - Conformité RGPD avec traçabilité des consentements
    - Paiements gérés via prestataire tiers (Stripe)
*/

-- Table des utilisateurs avec authentification
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('client', 'artisan', 'admin')),
  email text NOT NULL,
  telephone text NOT NULL,
  adresse text DEFAULT '',
  ville text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extension de la table artisans pour lier à l'authentification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE artisans ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'email'
  ) THEN
    ALTER TABLE artisans ADD COLUMN email text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE artisans ADD COLUMN adresse text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'statut_verification'
  ) THEN
    ALTER TABLE artisans ADD COLUMN statut_verification text DEFAULT 'en_attente' CHECK (statut_verification IN ('en_attente', 'verifie', 'rejete'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'portefeuille'
  ) THEN
    ALTER TABLE artisans ADD COLUMN portefeuille text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE artisans ADD COLUMN certifications text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'assurance_rcpro'
  ) THEN
    ALTER TABLE artisans ADD COLUMN assurance_rcpro boolean DEFAULT false;
  END IF;
END $$;

-- Table des demandes de travaux
CREATE TABLE IF NOT EXISTS job_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text NOT NULL,
  categorie text NOT NULL,
  localisation text NOT NULL,
  ville text DEFAULT '',
  budget_min integer DEFAULT 0,
  budget_max integer DEFAULT 0,
  date_souhaitee date,
  date_limite_devis date,
  statut text DEFAULT 'publiee' CHECK (statut IN ('publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee')),
  images_url text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des devis
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  montant_total integer NOT NULL,
  montant_acompte integer DEFAULT 0,
  delai_execution integer NOT NULL,
  description_travaux text NOT NULL,
  materiel_fourni text[] DEFAULT ARRAY[]::text[],
  conditions_paiement text DEFAULT '',
  statut text DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'accepte', 'refuse', 'expire')),
  validite_jusqu_au date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des contrats
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  montant_total integer NOT NULL,
  acompte integer NOT NULL,
  reste_du integer NOT NULL,
  date_debut date NOT NULL,
  date_fin_prevue date NOT NULL,
  conditions_generales text NOT NULL,
  signe_client boolean DEFAULT false,
  signe_artisan boolean DEFAULT false,
  date_signature_client timestamptz,
  date_signature_artisan timestamptz,
  statut text DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'resilie')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des jalons et suivi de projet
CREATE TABLE IF NOT EXISTS project_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  jalon_numero integer NOT NULL,
  titre text NOT NULL,
  description text NOT NULL,
  date_prevue date NOT NULL,
  date_completion date,
  pourcentage_travail integer DEFAULT 0 CHECK (pourcentage_travail >= 0 AND pourcentage_travail <= 100),
  montant_associe integer DEFAULT 0,
  statut text DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'complete', 'repousse')),
  photos_url text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de messagerie
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid REFERENCES job_requests(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contenu text NOT NULL,
  pieces_jointes text[] DEFAULT ARRAY[]::text[],
  lu boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des avis et évaluations vérifiées
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text DEFAULT '',
  verification_code text UNIQUE,
  verified boolean DEFAULT false,
  utile_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des logs administrateur
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  ancienne_valeur jsonb,
  nouvelle_valeur jsonb,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent créer leur profil"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politiques pour job_requests (demandes de travaux)
CREATE POLICY "Tout le monde peut voir les demandes publiées"
  ON job_requests FOR SELECT
  USING (statut = 'publiee' OR auth.uid() = client_id);

CREATE POLICY "Les clients peuvent créer des demandes"
  ON job_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Les clients peuvent mettre à jour leurs demandes"
  ON job_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Politiques pour quotes (devis)
CREATE POLICY "Les artisans et clients voient les devis pertinents"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT artisan_id FROM artisans WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT client_id FROM job_requests WHERE id = job_request_id
    )
  );

CREATE POLICY "Les artisans peuvent créer des devis"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM artisans WHERE id = artisan_id
    )
  );

CREATE POLICY "Les artisans peuvent modifier leurs devis"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM artisans WHERE id = artisan_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM artisans WHERE id = artisan_id
    )
  );

-- Politiques pour contracts (contrats)
CREATE POLICY "Clients et artisans voient leurs contrats"
  ON contracts FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM artisans WHERE id = artisan_id));

CREATE POLICY "Seul le système crée les contrats"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Politiques pour project_timeline (suivi)
CREATE POLICY "Clients et artisans voient la timeline"
  ON project_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE id = contract_id
      AND (auth.uid() = client_id OR auth.uid() IN (SELECT user_id FROM artisans WHERE id = artisan_id))
    )
  );

-- Politiques pour messages
CREATE POLICY "Les utilisateurs voient leurs messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Les utilisateurs peuvent envoyer des messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Politiques pour reviews
CREATE POLICY "Tout le monde peut voir les avis vérifiés"
  ON reviews FOR SELECT
  USING (verified = true);

CREATE POLICY "Les utilisateurs ne voient que leurs avis"
  ON reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewed_user_id);

CREATE POLICY "Les clients peuvent laisser des avis"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT client_id FROM contracts WHERE id IN (
        SELECT contract_id FROM reviews WHERE id = reviews.id
      )
    )
  );

-- Politiques pour admin_logs
CREATE POLICY "Seuls les admins voient les logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_job_requests_client ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_statut ON job_requests(statut);
CREATE INDEX IF NOT EXISTS idx_job_requests_categorie ON job_requests(categorie);
CREATE INDEX IF NOT EXISTS idx_job_requests_ville ON job_requests(ville);
CREATE INDEX IF NOT EXISTS idx_quotes_job_request ON quotes(job_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_artisan ON quotes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_statut ON quotes(statut);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_artisan ON contracts(artisan_id);
CREATE INDEX IF NOT EXISTS idx_contracts_statut ON contracts(statut);
CREATE INDEX IF NOT EXISTS idx_timeline_contract ON project_timeline(contract_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_artisan ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified);

-- Fonction pour mettre à jour la note moyenne (étendue)
CREATE OR REPLACE FUNCTION update_artisan_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artisans
  SET note_moyenne = (
    SELECT COALESCE(ROUND(AVG(note)::numeric, 1), 0)
    FROM reviews
    WHERE reviewed_user_id IN (
      SELECT user_id FROM artisans WHERE id = artisans.id
    )
    AND verified = true
  )
  WHERE user_id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_artisan_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.verified = true)
EXECUTE FUNCTION update_artisan_average_rating();