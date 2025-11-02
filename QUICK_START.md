# BuilderHub - Guide de démarrage rapide

## Installation et configuration

### 1. Prérequis
- Node.js 16+ installé
- Compte Supabase créé
- Variables d'environnement configurées

### 2. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet:
```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
```

### 3. Installation des dépendances
```bash
npm install
```

### 4. Démarrer le serveur de développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Premiers pas

### Créer un compte client

1. Allez sur http://localhost:5173
2. Cliquez "Inscription"
3. Sélectionnez "Client"
4. Remplissez:
   - Email (ex: client@test.com)
   - Mot de passe (min 6 caractères)
   - Téléphone
   - Adresse
   - Ville
5. Cliquez "Créer mon compte"

### Créer un compte artisan

1. Allez sur http://localhost:5173
2. Cliquez "Inscription"
3. Sélectionnez "Artisan"
4. Remplissez les mêmes champs
5. Votre profil sera en attente de vérification

### Publier une demande (en tant que client)

1. Connectez-vous avec votre compte client
2. Cliquez "Nouvelle demande"
3. Remplissez le formulaire:
   - **Titre**: "Réparation de plomberie"
   - **Catégorie**: "Plomberie"
   - **Description**: Décrivez vos besoins
   - **Localisation**: Votre quartier
   - **Ville**: Ouagadougou
   - **Budget**: 50000 - 100000 FCFA
4. Cliquez "Publier ma demande"

### Répondre avec un devis (en tant qu'artisan)

1. Connectez-vous avec votre compte artisan
2. Allez à l'onglet "Opportunités"
3. Voyez les demandes publiées
4. Cliquez "Répondre"
5. Remplissez le devis:
   - **Description**: Détaillez votre approche
   - **Montant total**: 75000 FCFA
   - **Acompte**: 37500 FCFA
   - **Délai**: 5 jours
   - **Matériel**: Tuyaux, raccords, joints
6. Cliquez "Envoyer le devis"

### Voir le devis (en tant que client)

1. Allez à l'onglet "Devis reçus"
2. Voyez le devis de l'artisan
3. Comparez avec d'autres devis
4. Cliquez "Voir détails" pour plus d'infos

### Suivi de projet

1. Une fois un devis accepté, un contrat est créé
2. Cliquez "Suivi du projet"
3. Ajoutez des jalons pour suivre l'avancement
4. Mettez à jour le statut et le pourcentage
5. Ajoutez des photos de progression

### Laisser un avis

1. Après complétion du projet
2. Client peut laisser un avis
3. Notation 1-5 étoiles + commentaire
4. Avis stocké en attente de vérification

## Accès au panel admin

Pour tester le panel administrateur:
1. Créer un utilisateur avec `user_type = 'admin'` via Supabase
2. Se connecter avec cet utilisateur
3. Voir le dashboard statistique complet

## Contacts intégrés

- **Chat en direct**: Disponible dans le centre d'aide
- **Téléphone**: +226 XX XX XX XX
- **Email**: support@builderhub.bf

## FAQ Rapide

**Q: Comment changer mon profil?**
R: Allez au tableau de bord, cliquez "Mon profil", éditez vos informations.

**Q: Quels sont les frais BuilderHub?**
R: Commission basée sur le montant du service (structure de paiement Stripe à configurer).

**Q: Comment résoudre un litige?**
R: Contactez notre support via le centre d'aide pour médiation.

**Q: Les paiements sont-ils sécurisés?**
R: Oui, via Stripe avec protocoles de sécurité bancaires.

**Q: Comment devenir artisan vérifié?**
R: Fournissez identité, assurance RC Pro et vérification pour validation.

## Dépannage

### L'application ne charge pas
- Vérifier que le serveur Vite est actif (`npm run dev`)
- Vérifier les variables d'environnement dans `.env`
- Vérifier la connexion internet

### Erreur d'authentification
- Vérifier que Supabase Auth est activé
- Vérifier les clés dans `.env`
- Vérifier que l'utilisateur existe dans la BD

### Pas de notifications
- Vérifier que la table messages existe
- Vérifier les permissions RLS
- Vérifier que Realtime est activé pour la table

### Devis/demandes non visibles
- Vérifier les RLS policies
- Vérifier que le statut est 'publiee' pour les demandes
- Vérifier les permissions utilisateur

## Performance

### Optimisations incluses
- Code splitting automatique (Vite)
- Images optimisées
- Lazy loading des routes
- Pagination des listes
- Indexes BD sur colonnes clés

### Monitoring
Pour une meilleure observabilité en production:
- Ajouter Sentry pour error tracking
- Ajouter Google Analytics
- Configurer les logs Supabase
- Ajouter health checks

## Build production

```bash
# Générer le build optimisé
npm run build

# Vérifier le build localement
npm run preview

# Les fichiers optimisés sont dans /dist/
```

## Déploiement

### Sur Vercel
```bash
# 1. Push le code sur GitHub
git push

# 2. Connecter le repo à Vercel
# 3. Configurer les env variables
# 4. Déploiement automatique
```

### Sur Netlify
```bash
# 1. Configurer netlify.toml
# 2. Connecter le repo
# 3. Deploiement automatique
```

## Logs et debugging

### Logs Supabase
```typescript
// Dans la console navigateur
supabase.from('your_table')
  .select('*')
  .then(({ data, error }) => {
    console.log({ data, error });
  });
```

### Vérifier les sessions
```typescript
const { data } = await supabase.auth.getSession();
console.log('Session:', data);
```

## Documentation détaillée

Pour plus de détails:
- Voir **IMPLEMENTATION_GUIDE.md** pour architecture complète
- Voir **COMPONENTS_SUMMARY.md** pour liste des composants
- Voir commentaires dans les fichiers sources TypeScript

## Support

- Consulter le centre d'aide intégré (icône ?)
- Email: support@builderhub.bf
- Chat en direct disponible

## Roadmap

✓ Phase 1: Plateforme core (COMPLÉTÉE)
- Authentification
- Demandes et devis
- Suivi de projet
- Messagerie
- Évaluations
- Admin panel

→ Phase 2: Paiements Stripe
→ Phase 3: Notifications avancées
→ Phase 4: Modération complète
→ Phase 5: Application mobile
→ Phase 6: Analytics ML

---

**Bon développement avec BuilderHub! 🚀**
