-- Add categorie_key column to job_requests for normalized category identifiers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'categorie_key'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN categorie_key TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_requests_categorie_key ON job_requests(categorie_key);

-- Backfill categorie_key for existing rows based on categorie label
UPDATE job_requests SET categorie_key = 'electricite' WHERE categorie IN ('Électricien bâtiment', 'Électricien industriel', 'Électricien auto') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'plomberie' WHERE categorie IN ('Plombier', 'Chauffagiste') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'maconnerie' WHERE categorie IN ('Maçon', 'Maçon en banco / terre') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'menuiserie' WHERE categorie IN ('Menuisier bois', 'Menuisier aluminium', 'Menuisier métallique', 'Menuisier fabricant meubles', 'Ébéniste', 'Tourneur sur bois', 'Sculpteur sur bois') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'peinture' WHERE categorie IN ('Peintre en bâtiment', 'Peintre décorateur', 'Peintre automobile', 'Peintre artistique') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'carrelage' WHERE categorie IN ('Carreleur', 'Faïencier', 'Marbrier') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'couverture' WHERE categorie IN ('Couvreur', 'Charpentier') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'serrurerie' WHERE categorie IN ('Serrurier', 'Serrurier dépannage', 'Forgeron', 'Ferronnier', 'Chaudronnier', 'Fabricant de portails', 'Fabricant d''outils', 'Soudeur') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'platrerie' WHERE categorie IN ('Plâtrier', 'Plaquiste', 'Poseur de faux plafonds') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'vitrerie' WHERE categorie = 'Vitrier / Miroitier' AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'etancheite' WHERE categorie IN ('Étancheur', 'Façadier') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'reparation' WHERE categorie IN ('Réparateur téléphone', 'Réparateur informatique', 'Réparateur TV', 'Réparateur électroménager', 'Réparateur climatiseur', 'Réparateur groupe électrogène', 'Réparateur machines industrielles', 'Réparateur moteurs') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'energie' WHERE categorie IN ('Installateur panneaux solaires', 'Installateur systèmes de pompage') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'telecom' WHERE categorie IN ('Technicien fibre / internet', 'Installateur antennes', 'Installateur caméras CCTV') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'mecanique' WHERE categorie IN ('Mécanicien automobile', 'Mécanicien moto', 'Mécanicien tricycle', 'Mécanicien vélo', 'Vulcanisateur', 'Carrossier') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'couture' WHERE categorie IN ('Couturier', 'Styliste', 'Tailleur traditionnel', 'Brodeur', 'Tisserand') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'cuir' WHERE categorie IN ('Cordonnier', 'Maroquinier', 'Fabricant chaussures', 'Fabricant sacs') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'beaute' WHERE categorie IN ('Coiffeur', 'Coiffeur dame', 'Coiffeur homme / barbier', 'Esthéticienne', 'Maquilleur') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'cosmetique' WHERE categorie IN ('Fabricant savon', 'Fabricant cosmétiques naturels', 'Fabricant beurre de karité', 'Fabricant huiles naturelles') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'alimentation' WHERE categorie IN ('Boulanger', 'Pâtissier', 'Traiteur', 'Restaurateur artisanal', 'Boucher', 'Charcutier', 'Poissonnier', 'Fromager', 'Brasseur artisanal', 'Fabricant jus naturels', 'Torréfacteur café') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'art' WHERE categorie IN ('Sculpteur', 'Céramiste', 'Potier', 'Fabricant bijoux', 'Bijoutier', 'Orfèvre', 'Graveur', 'Fabricant objets décoratifs') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'artisanat' WHERE categorie IN ('Vannier', 'Fabricant paniers', 'Fabricant nattes', 'Fabricant balais', 'Fabricant calebasses', 'Fabricant masques', 'Fabricant instruments traditionnels', 'Fabricant statues') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'environnement' WHERE categorie IN ('Apiculteur', 'Fabricant miel', 'Fabricant charbon écologique', 'Fabricant briquettes combustibles', 'Recycleur artisanal', 'Fabricant compost') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'transport' WHERE categorie IN ('Chauffeur', 'Livreur') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'services' WHERE categorie IN ('Déménageur artisanal', 'Nettoyage professionnel', 'Aide ménagère') AND (categorie_key IS NULL OR categorie_key = '');
UPDATE job_requests SET categorie_key = 'securite' WHERE categorie IN ('Agent de sécurité', 'Garde du corps', 'Gardien') AND (categorie_key IS NULL OR categorie_key = '');

-- Backfill categorie_id for existing rows
UPDATE job_requests SET categorie_id = '1' WHERE categorie_key = 'electricite' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '2' WHERE categorie_key = 'plomberie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '3' WHERE categorie_key = 'maconnerie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '4' WHERE categorie_key = 'menuiserie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '5' WHERE categorie_key = 'peinture' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '6' WHERE categorie_key = 'carrelage' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '7' WHERE categorie_key = 'couverture' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '8' WHERE categorie_key = 'serrurerie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '9' WHERE categorie_key = 'platrerie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '10' WHERE categorie_key = 'vitrerie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '11' WHERE categorie_key = 'etancheite' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '12' WHERE categorie_key = 'reparation' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '13' WHERE categorie_key = 'energie' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '14' WHERE categorie_key = 'telecom' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '15' WHERE categorie_key = 'mecanique' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '16' WHERE categorie_key = 'couture' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '17' WHERE categorie_key = 'cuir' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '18' WHERE categorie_key = 'beaute' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '19' WHERE categorie_key = 'cosmetique' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '20' WHERE categorie_key = 'alimentation' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '21' WHERE categorie_key = 'art' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '22' WHERE categorie_key = 'artisanat' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '23' WHERE categorie_key = 'environnement' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '24' WHERE categorie_key = 'transport' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '25' WHERE categorie_key = 'services' AND (categorie_id IS NULL OR categorie_id = '');
UPDATE job_requests SET categorie_id = '26' WHERE categorie_key = 'securite' AND (categorie_id IS NULL OR categorie_id = '');
