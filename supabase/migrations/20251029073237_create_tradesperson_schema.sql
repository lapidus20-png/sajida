/*
  # Schéma pour l'application des artisans du Burkina Faso

  1. Nouvelles Tables
    - `artisans` - Profils des artisans/commerçants
      - `id` (uuid, clé primaire)
      - `nom` (texte, obligatoire) - Nom de l'artisan
      - `prenom` (texte, obligatoire) - Prénom de l'artisan
      - `telephone` (texte, unique, obligatoire) - Numéro de téléphone
      - `ville` (texte) - Ville (ex: Ouagadougou, Bobo-Dioulasso)
      - `quartier` (texte) - Quartier/Zone
      - `metier` (texte, obligatoire) - Type de métier (plombier, électricien, etc.)
      - `description` (texte) - Description des services offerts
      - `photo_url` (texte) - URL de la photo de profil
      - `annees_experience` (entier) - Années d'expérience
      - `tarif_horaire` (entier) - Tarif horaire en FCFA
      - `disponible` (booléen) - Disponibilité actuelle
      - `note_moyenne` (numérique) - Note moyenne (0-5)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `services` - Demandes de services
      - `id` (uuid, clé primaire)
      - `artisan_id` (uuid, clé étrangère vers artisans)
      - `client_nom` (texte, obligatoire) - Nom du client
      - `client_telephone` (texte, obligatoire) - Téléphone du client
      - `description` (texte, obligatoire) - Description du travail demandé
      - `adresse` (texte) - Adresse du chantier
      - `date_souhaitee` (date) - Date souhaitée pour le service
      - `statut` (texte) - Statut: en_attente, accepte, en_cours, termine, annule
      - `budget_estime` (entier) - Budget estimé en FCFA
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `avis` - Avis et évaluations
      - `id` (uuid, clé primaire)
      - `artisan_id` (uuid, clé étrangère vers artisans)
      - `service_id` (uuid, clé étrangère vers services)
      - `client_nom` (texte, obligatoire) - Nom du client
      - `note` (entier, obligatoire) - Note de 1 à 5
      - `commentaire` (texte) - Commentaire détaillé
      - `created_at` (timestamp)

  2. Sécurité
    - Activer RLS sur toutes les tables
    - Politiques pour permettre la lecture publique des artisans
    - Politiques pour la gestion des services et avis
*/

-- Table des artisans
CREATE TABLE IF NOT EXISTS artisans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  telephone text UNIQUE NOT NULL,
  ville text DEFAULT '',
  quartier text DEFAULT '',
  metier text NOT NULL,
  description text DEFAULT '',
  photo_url text DEFAULT '',
  annees_experience integer DEFAULT 0,
  tarif_horaire integer DEFAULT 0,
  disponible boolean DEFAULT true,
  note_moyenne numeric(2,1) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des services/demandes
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans(id) ON DELETE CASCADE,
  client_nom text NOT NULL,
  client_telephone text NOT NULL,
  description text NOT NULL,
  adresse text DEFAULT '',
  date_souhaitee date,
  statut text DEFAULT 'en_attente',
  budget_estime integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des avis
CREATE TABLE IF NOT EXISTS avis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  client_nom text NOT NULL,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- Politiques pour artisans (lecture publique)
CREATE POLICY "Tout le monde peut voir les artisans"
  ON artisans FOR SELECT
  USING (true);

CREATE POLICY "Tout le monde peut créer un profil artisan"
  ON artisans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Artisans peuvent mettre à jour leur profil"
  ON artisans FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Politiques pour services
CREATE POLICY "Tout le monde peut voir les services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Tout le monde peut créer une demande de service"
  ON services FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut mettre à jour les services"
  ON services FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Politiques pour avis
CREATE POLICY "Tout le monde peut voir les avis"
  ON avis FOR SELECT
  USING (true);

CREATE POLICY "Tout le monde peut créer un avis"
  ON avis FOR INSERT
  WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_artisans_metier ON artisans(metier);
CREATE INDEX IF NOT EXISTS idx_artisans_ville ON artisans(ville);
CREATE INDEX IF NOT EXISTS idx_services_artisan ON services(artisan_id);
CREATE INDEX IF NOT EXISTS idx_services_statut ON services(statut);
CREATE INDEX IF NOT EXISTS idx_avis_artisan ON avis(artisan_id);

-- Fonction pour mettre à jour la note moyenne d'un artisan
CREATE OR REPLACE FUNCTION update_artisan_note_moyenne()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artisans
  SET note_moyenne = (
    SELECT COALESCE(AVG(note), 0)
    FROM avis
    WHERE artisan_id = NEW.artisan_id
  )
  WHERE id = NEW.artisan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement la note moyenne
CREATE TRIGGER trigger_update_note_moyenne
AFTER INSERT ON avis
FOR EACH ROW
EXECUTE FUNCTION update_artisan_note_moyenne();