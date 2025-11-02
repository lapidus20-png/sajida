# Guide de Géolocalisation - BuilderHub

## 📍 Vue d'ensemble

BuilderHub intègre désormais un système complet de géolocalisation permettant de calculer et d'afficher les distances entre clients et artisans en temps réel.

---

## ✅ Fonctionnalités implémentées

### 1. **Base de données**
- ✅ Colonnes `latitude` et `longitude` sur la table `artisans`
- ✅ Colonnes `latitude` et `longitude` sur la table `job_requests`
- ✅ Fonction SQL `calculate_distance()` utilisant la formule Haversine
- ✅ Indexes optimisés pour les requêtes géographiques

### 2. **Composant LocationPicker**
Permet de sélectionner une position GPS de plusieurs façons:

**Méthodes de sélection:**
- 🎯 **GPS automatique**: Utilise la géolocalisation du navigateur
- ⌨️ **Saisie manuelle**: Coordonnées latitude/longitude
- 🔍 **Vérification**: Lien direct vers Google Maps

**Utilisation:**
```typescript
<LocationPicker
  initialLat={12.3714}
  initialLng={-1.5197}
  onLocationSelect={(lat, lng, address) => {
    // Sauvegarder la position
  }}
  onClose={() => setShowPicker(false)}
/>
```

### 3. **Affichage des distances**

#### Dans ArtisanCard
- Badge bleu avec icône navigation
- Distance calculée automatiquement
- Affichage conditionnel (seulement si les deux positions sont connues)

```typescript
<ArtisanCard
  artisan={artisan}
  userLat={clientLatitude}
  userLng={clientLongitude}
  onContact={handleContact}
/>
```

#### Dans ArtisanDashboard
- Distance affichée sur chaque opportunité
- Badge avec icône et distance en km
- Aide à choisir les projets proches

### 4. **Intégration dans les formulaires**

#### AddArtisanModal
- Bouton "Définir ma position"
- Position sauvegardée avec le profil
- Affichage des coordonnées sélectionnées

#### JobRequestForm
- Bouton "Définir la position du chantier"
- Position liée à la demande
- Message informatif pour les artisans

---

## 🧮 Calcul des distances

### Formule utilisée: Haversine

La formule Haversine calcule la distance orthodromique (à vol d'oiseau) entre deux points sur une sphère.

**Paramètres:**
- Rayon terrestre: 6371 km
- Précision: 2 décimales (ex: 12.45 km)
- Unité: kilomètres

**Exemple de calcul:**
```typescript
import { calculateDistance } from './lib/supabase';

// Ouagadougou
const lat1 = 12.3714;
const lng1 = -1.5197;

// Bobo-Dioulasso
const lat2 = 11.1776;
const lng2 = -4.2976;

const distance = calculateDistance(lat1, lng1, lat2, lng2);
// Résultat: ~335 km
```

### Implémentation SQL
```sql
CREATE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  r numeric := 6371; -- Rayon de la Terre en km
  -- ... formule Haversine
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## 📱 Utilisation par rôle

### Pour les Clients

1. **Créer une demande:**
   - Cliquer sur "Nouvelle demande"
   - Remplir les informations
   - Cliquer "Définir la position du chantier"
   - Autoriser la géolocalisation ou saisir manuellement
   - Publier la demande

2. **Bénéfice:**
   - Les artisans voient la distance depuis chez eux
   - Meilleure estimation du déplacement
   - Devis plus précis

### Pour les Artisans

1. **Configurer son profil:**
   - Dans "Ajouter un artisan"
   - Cliquer "Définir ma position"
   - Confirmer la position de son atelier/domicile

2. **Consulter les opportunités:**
   - Voir les demandes avec distance affichée
   - Filtrer par distance (optionnel)
   - Choisir les projets proches

3. **Bénéfice:**
   - Voir immédiatement si le chantier est accessible
   - Optimiser ses déplacements
   - Réduire les frais de transport

---

## 🎯 Scénarios d'utilisation

### Scénario 1: Artisan proche
```
Client: Position à Ouagadougou secteur 15 (12.3800, -1.5100)
Artisan: Position à Ouagadougou secteur 30 (12.3600, -1.5300)
Distance calculée: ~3 km

Résultat: Badge bleu "3 km" affiché
Avantage: Déplacement rapide et économique
```

### Scénario 2: Artisan éloigné
```
Client: Position à Ouagadougou (12.3714, -1.5197)
Artisan: Position à Bobo-Dioulasso (11.1776, -4.2976)
Distance calculée: ~335 km

Résultat: Badge bleu "335 km" affiché
Décision: L'artisan peut ajuster son devis selon la distance
```

### Scénario 3: Sans géolocalisation
```
Client: Pas de position GPS définie
Artisan: Position définie

Résultat: Pas de badge de distance affiché
Fonctionnement: La plateforme fonctionne normalement
Note: Géolocalisation optionnelle
```

---

## 🛠️ Guide technique

### Structure de la base de données

```sql
-- Table artisans
ALTER TABLE artisans
ADD COLUMN latitude numeric(10, 8),
ADD COLUMN longitude numeric(11, 8);

-- Table job_requests
ALTER TABLE job_requests
ADD COLUMN latitude numeric(10, 8),
ADD COLUMN longitude numeric(11, 8);

-- Index pour performance
CREATE INDEX idx_artisans_location ON artisans(latitude, longitude);
CREATE INDEX idx_job_requests_location ON job_requests(latitude, longitude);
```

### Types TypeScript

```typescript
export interface Artisan {
  // ... autres champs
  latitude?: number;
  longitude?: number;
}

export interface JobRequest {
  // ... autres champs
  latitude?: number;
  longitude?: number;
}

// Fonction utilitaire
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number;
```

### Composants créés

```
src/components/
├── LocationPicker.tsx       # Sélection GPS (200 lignes)
├── DistanceFilter.tsx       # Filtre par distance (50 lignes)
├── ArtisanCard.tsx          # Modifié pour afficher distance
├── AddArtisanModal.tsx      # Intégration LocationPicker
├── JobRequestForm.tsx       # Intégration LocationPicker
└── ArtisanDashboard.tsx     # Affichage distance opportunités
```

---

## 🌍 Coordonnées de référence (Burkina Faso)

### Principales villes

| Ville | Latitude | Longitude |
|-------|----------|-----------|
| Ouagadougou | 12.3714 | -1.5197 |
| Bobo-Dioulasso | 11.1776 | -4.2976 |
| Koudougou | 12.2522 | -2.3639 |
| Banfora | 10.6331 | -4.7588 |
| Ouahigouya | 13.5828 | -2.4208 |

### Exemple de distances

| Trajet | Distance |
|--------|----------|
| Ouagadougou → Bobo-Dioulasso | ~335 km |
| Ouagadougou → Koudougou | ~95 km |
| Bobo-Dioulasso → Banfora | ~85 km |
| Ouagadougou → Ouahigouya | ~180 km |

---

## 🔒 Confidentialité et sécurité

### Données stockées
- ✅ Coordonnées GPS (latitude, longitude)
- ✅ Stockées en base de données Supabase
- ✅ Chiffrées au repos
- ✅ Accès contrôlé par RLS

### Consentement
- ❌ Géolocalisation **optionnelle**
- ✅ L'utilisateur choisit de partager ou non
- ✅ Fonctionne sans géolocalisation
- ✅ Peut être modifié à tout moment

### Permissions navigateur
- Demande d'autorisation explicite
- Utilise l'API Geolocation standard
- Fonctionne sur tous les navigateurs modernes
- Alternative manuelle si refusé

---

## 📊 Impact sur la plateforme

### Avantages clients
- ✅ Meilleure sélection des artisans
- ✅ Estimation réaliste des frais de déplacement
- ✅ Temps de réponse optimisé
- ✅ Artisans locaux mis en avant

### Avantages artisans
- ✅ Opportunités géographiquement pertinentes
- ✅ Optimisation des déplacements
- ✅ Réduction des coûts de transport
- ✅ Meilleure planification

### Avantages plateforme
- ✅ Matching plus intelligent
- ✅ Satisfaction utilisateur accrue
- ✅ Moins de devis inappropriés
- ✅ Efficacité globale améliorée

---

## 🚀 Améliorations futures possibles

### Phase 2 (court terme)
- [ ] Filtre par rayon de distance
- [ ] Tri automatique par distance
- [ ] Notification si artisan trop éloigné
- [ ] Estimation temps de trajet (API externe)

### Phase 3 (moyen terme)
- [ ] Carte interactive Google Maps
- [ ] Visualisation zones de couverture
- [ ] Itinéraires optimisés
- [ ] Frais de déplacement automatiques

### Phase 4 (long terme)
- [ ] Géofencing (alertes zone)
- [ ] Heatmap des demandes
- [ ] Analytics géographiques
- [ ] Prédictions ML basées sur localisation

---

## 🧪 Tests et validation

### Tests manuels effectués
- ✅ Géolocalisation navigateur (Chrome, Firefox)
- ✅ Saisie manuelle coordonnées
- ✅ Calcul distance Ouaga-Bobo (~335 km)
- ✅ Affichage badges dans ArtisanCard
- ✅ Affichage distances dans ArtisanDashboard
- ✅ Sauvegarde en base de données
- ✅ Build sans erreurs TypeScript

### Cas limites gérés
- ✅ Géolocalisation refusée → Saisie manuelle
- ✅ Coordonnées manquantes → Pas d'affichage distance
- ✅ Coordonnées invalides → Validation
- ✅ Permission non supportée → Fallback

---

## 📞 Support

### Questions fréquentes

**Q: La géolocalisation est-elle obligatoire?**
R: Non, c'est optionnel. La plateforme fonctionne sans.

**Q: Mes coordonnées sont-elles privées?**
R: Seule la distance calculée est visible, pas vos coordonnées exactes.

**Q: Comment modifier ma position?**
R: Retournez dans le formulaire et cliquez à nouveau sur le bouton de position.

**Q: La distance est-elle précise?**
R: C'est une distance "à vol d'oiseau". La route réelle peut être plus longue.

**Q: Puis-je voir tous les artisans sans filtre?**
R: Oui, le filtre par distance est optionnel.

---

## 📝 Changelog

### Version 1.1.0 (2024)
- ✅ Ajout composant LocationPicker
- ✅ Intégration géolocalisation artisans
- ✅ Intégration géolocalisation demandes
- ✅ Calcul et affichage distances
- ✅ Migration SQL avec fonction Haversine
- ✅ Types TypeScript étendus
- ✅ Composant DistanceFilter
- ✅ Documentation complète

---

## 🎓 Ressources

### APIs utilisées
- **Geolocation API** (navigateur) - Position actuelle
- **Nominatim API** (OpenStreetMap) - Géocodage inverse
- **Google Maps** (lien externe) - Vérification position

### Formules mathématiques
- **Haversine** - Distance orthodromique
- **WGS84** - Système de coordonnées (GPS standard)

### Documentation externe
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Formule Haversine](https://en.wikipedia.org/wiki/Haversine_formula)
- [OpenStreetMap Nominatim](https://nominatim.org/)

---

**Statut**: ✅ Géolocalisation complète implémentée et testée
**Dernière mise à jour**: 2024
**Version**: 1.1.0
