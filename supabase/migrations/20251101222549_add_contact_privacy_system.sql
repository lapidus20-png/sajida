/*
  # Système de confidentialité des coordonnées

  1. Nouvelles fonctions
    - can_view_contact_info: Vérifie si l'utilisateur peut voir les coordonnées
    - mask_phone: Masque un numéro de téléphone
    - mask_email: Masque une adresse email

  2. Logique de démasquage
    - Client peut voir coordonnées artisan après paiement d'acompte
    - Artisan peut voir coordonnées client après acceptation devis
    - Admin peut toujours voir

  3. Sécurité
    - Fonctions SQL côté serveur
    - Pas de données sensibles exposées sans vérification
*/

-- Fonction pour vérifier si un utilisateur peut voir les coordonnées d'un autre
CREATE OR REPLACE FUNCTION can_view_contact_info(
  viewer_id uuid,
  target_user_id uuid,
  contract_id_param uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  has_paid boolean := false;
  has_accepted_quote boolean := false;
  is_admin boolean := false;
BEGIN
  -- Si c'est le même utilisateur, il peut voir ses propres infos
  IF viewer_id = target_user_id THEN
    RETURN true;
  END IF;

  -- Vérifier si l'utilisateur est admin
  SELECT EXISTS(
    SELECT 1 FROM users 
    WHERE id = viewer_id AND role = 'admin'
  ) INTO is_admin;

  IF is_admin THEN
    RETURN true;
  END IF;

  -- Si un contract_id est fourni, vérifier le paiement
  IF contract_id_param IS NOT NULL THEN
    -- Vérifier si un acompte a été payé pour ce contrat
    SELECT EXISTS(
      SELECT 1 FROM transactions
      WHERE contract_id = contract_id_param
        AND (payer_id = viewer_id OR receiver_id = viewer_id)
        AND transaction_type IN ('acompte', 'paiement_partiel', 'solde')
        AND status = 'complete'
    ) INTO has_paid;

    IF has_paid THEN
      RETURN true;
    END IF;

    -- Vérifier si c'est un contrat accepté entre les deux parties
    SELECT EXISTS(
      SELECT 1 FROM contracts
      WHERE id = contract_id_param
        AND ((client_id = viewer_id AND artisan_id = target_user_id)
          OR (artisan_id = viewer_id AND client_id = target_user_id))
        AND statut IN ('accepte', 'en_cours', 'termine')
    ) INTO has_accepted_quote;

    IF has_accepted_quote THEN
      RETURN true;
    END IF;
  END IF;

  -- Sinon, pas d'accès aux coordonnées
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour masquer un numéro de téléphone
CREATE OR REPLACE FUNCTION mask_phone(phone_number text)
RETURNS text AS $$
BEGIN
  IF phone_number IS NULL OR LENGTH(phone_number) < 4 THEN
    RETURN '***';
  END IF;
  
  -- Garder les 2 premiers et 2 derniers chiffres
  -- Ex: +22670123456 → +226XX...X56
  RETURN SUBSTRING(phone_number FROM 1 FOR 4) || 
         REPEAT('X', GREATEST(0, LENGTH(phone_number) - 6)) || 
         SUBSTRING(phone_number FROM LENGTH(phone_number) - 1 FOR 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour masquer une adresse email
CREATE OR REPLACE FUNCTION mask_email(email_address text)
RETURNS text AS $$
DECLARE
  local_part text;
  domain_part text;
  at_position integer;
BEGIN
  IF email_address IS NULL OR email_address = '' THEN
    RETURN '***@***.***';
  END IF;

  at_position := POSITION('@' IN email_address);
  
  IF at_position = 0 THEN
    RETURN '***@***.***';
  END IF;

  local_part := SUBSTRING(email_address FROM 1 FOR at_position - 1);
  domain_part := SUBSTRING(email_address FROM at_position + 1);

  -- Masquer la partie locale (garder 1er et dernier caractère)
  IF LENGTH(local_part) <= 2 THEN
    local_part := SUBSTRING(local_part FROM 1 FOR 1) || '***';
  ELSE
    local_part := SUBSTRING(local_part FROM 1 FOR 1) || 
                  REPEAT('*', LENGTH(local_part) - 2) || 
                  SUBSTRING(local_part FROM LENGTH(local_part) FOR 1);
  END IF;

  -- Masquer une partie du domaine
  RETURN local_part || '@' || 
         SUBSTRING(domain_part FROM 1 FOR 1) || 
         '***.' || 
         SPLIT_PART(domain_part, '.', ARRAY_LENGTH(STRING_TO_ARRAY(domain_part, '.'), 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Commentaires
COMMENT ON FUNCTION can_view_contact_info IS 'Vérifie si un utilisateur peut voir les coordonnées complètes';
COMMENT ON FUNCTION mask_phone IS 'Masque un numéro de téléphone';
COMMENT ON FUNCTION mask_email IS 'Masque une adresse email';
