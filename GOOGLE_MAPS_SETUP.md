# Configuration Google Maps API

## Étape 1: Obtenir une clé API Google Maps

### 1. Créer un compte Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google
3. Acceptez les conditions d'utilisation

### 2. Créer un nouveau projet
1. Cliquez sur "Sélectionner un projet" en haut
2. Cliquez sur "Nouveau projet"
3. Donnez un nom à votre projet (ex: "Plateforme Artisans")
4. Cliquez sur "Créer"

### 3. Activer l'API Google Maps
1. Dans le menu, allez à "APIs & Services" > "Bibliothèque"
2. Recherchez et activez ces APIs:
   - **Maps JavaScript API** (obligatoire)
   - **Geocoding API** (obligatoire)
   - **Places API** (recommandé)
   - **Geolocation API** (recommandé)

### 4. Créer une clé API
1. Allez à "APIs & Services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "Clé API"
3. Copiez votre clé API

### 5. Sécuriser votre clé API (IMPORTANT!)

#### Pour le développement local:
1. Cliquez sur votre clé API pour la modifier
2. Sous "Restrictions relatives à l'application":
   - Sélectionnez "Référents HTTP (sites web)"
   - Ajoutez: `http://localhost:*` et `http://127.0.0.1:*`

#### Pour la production:
1. Ajoutez votre domaine: `https://votredomaine.com/*`
2. Sous "Restrictions relatives aux API":
   - Sélectionnez "Restreindre la clé"
   - Cochez uniquement les APIs utilisées:
     - Maps JavaScript API
     - Geocoding API
     - Places API
     - Geolocation API

## Étape 2: Configurer la clé dans votre application

1. Ouvrez le fichier `.env` à la racine du projet
2. Remplacez `YOUR_GOOGLE_MAPS_API_KEY` par votre vraie clé:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Redémarrez votre serveur de développement

## Étape 3: Configurer les permissions de géolocalisation

### Pour Chrome/Edge:
1. Ouvrez les paramètres du navigateur
2. Allez à "Confidentialité et sécurité" > "Paramètres des sites"
3. Cliquez sur "Position"
4. Ajoutez `http://localhost:5173` à la liste "Autorisés"

### Pour Firefox:
1. Cliquez sur l'icône de cadenas à gauche de l'URL
2. Cliquez sur "Autoriser" pour la permission de localisation
3. Rafraîchissez la page

### Pour Safari:
1. Allez à "Safari" > "Préférences" > "Sites web" > "Localisation"
2. Trouvez `localhost` et sélectionnez "Autoriser"

## Étape 4: Tester la géolocalisation

1. Ouvrez l'application dans votre navigateur
2. Allez sur une page avec la carte (ex: ajouter un artisan)
3. Cliquez sur "Ma position"
4. Autorisez l'accès à la localisation si demandé
5. La carte devrait se centrer sur votre position

## Fonctionnalités Google Maps implémentées

### 1. Carte interactive
- ✅ Zoom et déplacement fluides
- ✅ Contrôles de carte (zoom, type, plein écran)
- ✅ Vue satellite et plan
- ✅ Street View activé

### 2. Géolocalisation
- ✅ Détection automatique de la position
- ✅ Gestion des erreurs avec messages détaillés
- ✅ Options haute précision:
  - `enableHighAccuracy: true` - Utilise GPS au lieu de WiFi/IP
  - `timeout: 10000` - Attend 10 secondes maximum
  - `maximumAge: 0` - Position en temps réel

### 3. Geocoding
- ✅ Conversion coordonnées → adresse (reverse geocoding)
- ✅ Recherche d'adresses
- ✅ Affichage en français

### 4. Marqueurs interactifs
- ✅ Marqueurs draggables (déplaçables)
- ✅ Animation de drop
- ✅ Clic sur la carte pour placer un marqueur

### 5. Configuration recommandée
- ✅ Langue française
- ✅ Région Burkina Faso (BF)
- ✅ Gestion tactile optimisée
- ✅ Tous les contrôles positionnés correctement

## Messages d'erreur et solutions

### "Clé API Google Maps non configurée"
**Solution:** Suivez l'Étape 1 et 2 ci-dessus

### "Accès à la localisation refusé"
**Solution:**
1. Autorisez la localisation dans les paramètres de votre navigateur
2. Suivez l'Étape 3 ci-dessus
3. Rafraîchissez la page

### "Position indisponible"
**Solution:**
1. Vérifiez que votre GPS est activé (sur mobile)
2. Vérifiez votre connexion WiFi
3. Essayez de vous déplacer près d'une fenêtre

### "Délai d'attente dépassé"
**Solution:**
1. Votre connexion est peut-être lente
2. Réessayez dans quelques secondes
3. Vérifiez que les services de localisation sont activés

### "This API project is not authorized to use this API"
**Solution:**
1. Retournez sur Google Cloud Console
2. Vérifiez que les APIs sont bien activées (Étape 1.3)
3. Vérifiez les restrictions de votre clé API

## Coûts et limites

### Crédits gratuits
Google offre **200$/mois** de crédits gratuits pour tous les services Google Maps

### Utilisation gratuite mensuelle
- Maps JavaScript API: **28,500** chargements de carte
- Geocoding API: **40,000** requêtes
- Places API: **28,500** requêtes

### Tarification au-delà des limites gratuites
- Maps JavaScript API: 7$/1000 chargements
- Geocoding API: 5$/1000 requêtes
- Places API: Varie selon le type de requête

**Note:** Pour une petite application, vous resterez largement dans les limites gratuites!

## Alternatives sans Google Maps

Si vous ne voulez pas utiliser Google Maps, l'application utilise automatiquement:
- **OpenStreetMap** pour le geocoding
- **Saisie manuelle** des coordonnées GPS

Le composant `LocationPicker` sera utilisé au lieu de `GoogleMapPicker`.

## Support

Pour plus d'informations:
- [Documentation Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Guide de tarification](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Meilleures pratiques de sécurité](https://developers.google.com/maps/api-security-best-practices)
