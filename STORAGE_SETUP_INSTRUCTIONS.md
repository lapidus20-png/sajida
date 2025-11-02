# 📦 Instructions de Configuration Storage - BuilderHub

## ⚠️ IMPORTANT: Configuration Manuelle Requise

Le système de storage est **prêt côté code** mais nécessite une **configuration manuelle** dans le dashboard Supabase.

---

## 🚀 Étapes de Configuration (15 minutes)

### Étape 1: Accéder au Dashboard Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet BuilderHub
3. Aller dans **Storage** dans le menu latéral

### Étape 2: Créer les 4 Buckets

#### Bucket 1: `avatars`
```
Cliquer "New bucket"

Settings:
  Name: avatars
  Public bucket: ✅ YES
  File size limit: 2097152 (2MB)
  Allowed MIME types:
    - image/jpeg
    - image/png
    - image/webp

Cliquer "Create bucket"
```

#### Bucket 2: `portfolios`
```
Cliquer "New bucket"

Settings:
  Name: portfolios
  Public bucket: ✅ YES
  File size limit: 5242880 (5MB)
  Allowed MIME types:
    - image/jpeg
    - image/png
    - image/webp

Cliquer "Create bucket"
```

#### Bucket 3: `documents`
```
Cliquer "New bucket"

Settings:
  Name: documents
  Public bucket: ❌ NO (Private)
  File size limit: 10485760 (10MB)
  Allowed MIME types:
    - application/pdf
    - image/jpeg
    - image/png

Cliquer "Create bucket"
```

#### Bucket 4: `project-photos`
```
Cliquer "New bucket"

Settings:
  Name: project-photos
  Public bucket: ❌ NO (Private)
  File size limit: 5242880 (5MB)
  Allowed MIME types:
    - image/jpeg
    - image/png
    - image/webp

Cliquer "Create bucket"
```

---

### Étape 3: Configurer les Policies RLS

Pour **chaque bucket**, vous devez créer 4 policies (SELECT, INSERT, UPDATE, DELETE).

#### Pour le bucket `avatars`:

1. Cliquer sur le bucket `avatars`
2. Aller dans l'onglet **Policies**
3. Cliquer **New Policy** 4 fois (une pour chaque opération)

**Policy 1 - SELECT (Public read):**
```
Operation: SELECT
Policy name: Public read avatars
Target roles: public

Using expression:
bucket_id = 'avatars'
```

**Policy 2 - INSERT (Owner only):**
```
Operation: INSERT
Policy name: Users can upload own avatar
Target roles: authenticated

With check expression:
bucket_id = 'avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 3 - UPDATE (Owner only):**
```
Operation: UPDATE
Policy name: Users can update own avatar
Target roles: authenticated

Using expression:
bucket_id = 'avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 4 - DELETE (Owner only):**
```
Operation: DELETE
Policy name: Users can delete own avatar
Target roles: authenticated

Using expression:
bucket_id = 'avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Pour le bucket `portfolios`:

**Utiliser les MÊMES policies que avatars**, juste changer:
- `bucket_id = 'portfolios'`
- Noms des policies avec "portfolios"

#### Pour le bucket `documents`:

**Policy 1 - SELECT (Owner only - PRIVÉ):**
```
Operation: SELECT
Policy name: Users can view own documents
Target roles: authenticated

Using expression:
bucket_id = 'documents' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 2 - INSERT (Owner only):**
```
Operation: INSERT
Policy name: Users can upload own documents
Target roles: authenticated

With check expression:
bucket_id = 'documents' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 3 - UPDATE (Owner only):**
```
Operation: UPDATE
Policy name: Users can update own documents
Target roles: authenticated

Using expression:
bucket_id = 'documents' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 4 - DELETE (Owner only):**
```
Operation: DELETE
Policy name: Users can delete own documents
Target roles: authenticated

Using expression:
bucket_id = 'documents' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Pour le bucket `project-photos`:

**Policy 1 - SELECT (Contract parties):**
```
Operation: SELECT
Policy name: Contract parties can view project photos
Target roles: authenticated

Using expression:
bucket_id = 'project-photos' AND (
  auth.uid()::text = (storage.foldername(name))[1]
  OR
  EXISTS (
    SELECT 1 FROM contracts
    WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
    AND id::text = (storage.foldername(name))[1]
  )
)
```

**Policy 2 - INSERT (Contract parties):**
```
Operation: INSERT
Policy name: Contract parties can upload project photos
Target roles: authenticated

With check expression:
bucket_id = 'project-photos' AND
EXISTS (
  SELECT 1 FROM contracts
  WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
  AND id::text = (storage.foldername(name))[1]
)
```

**Policy 3 - UPDATE (Contract parties):**
```
Operation: UPDATE
Policy name: Contract parties can update project photos
Target roles: authenticated

Using expression:
bucket_id = 'project-photos' AND
EXISTS (
  SELECT 1 FROM contracts
  WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
  AND id::text = (storage.foldername(name))[1]
)
```

**Policy 4 - DELETE (Contract parties):**
```
Operation: DELETE
Policy name: Contract parties can delete project photos
Target roles: authenticated

Using expression:
bucket_id = 'project-photos' AND
EXISTS (
  SELECT 1 FROM contracts
  WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
  AND id::text = (storage.foldername(name))[1]
)
```

---

## ✅ Vérification

Après avoir créé tous les buckets et policies:

### 1. Vérifier les buckets
```
Dans Storage > Tous les buckets doivent apparaître:
✅ avatars (public)
✅ portfolios (public)
✅ documents (private)
✅ project-photos (private)
```

### 2. Vérifier les policies
```
Pour chaque bucket:
✅ 4 policies (SELECT, INSERT, UPDATE, DELETE)
✅ Pas d'erreurs dans les expressions SQL
```

### 3. Tester l'upload
```
1. Lancer l'app: npm run dev
2. Aller dans "Ajouter un artisan"
3. Essayer d'uploader une photo de profil
4. Vérifier que l'upload fonctionne
5. Vérifier que la photo s'affiche
```

---

## 📊 Récapitulatif

**Ce qui est DÉJÀ fait (côté code):**
- ✅ Service storageService.ts (upload, delete, list)
- ✅ Composant FileUpload.tsx (UI d'upload)
- ✅ Validation fichiers (taille, type)
- ✅ Intégration dans AddArtisanModal
- ✅ Gestion d'erreurs
- ✅ Preview d'images

**Ce qui reste à faire (MANUEL):**
- ⏳ Créer 4 buckets dans dashboard
- ⏳ Configurer 16 policies RLS (4 par bucket)
- ⏳ Tester les uploads

**Temps estimé:** 15-20 minutes

---

## 🆘 En cas de problème

### Erreur "Bucket not found"
```
Solution: Vérifier que le bucket est bien créé et que le nom est exact
```

### Erreur "new row violates row-level security policy"
```
Solution: Vérifier que les policies sont bien configurées
Vérifier que l'utilisateur est authentifié
```

### Erreur "File too large"
```
Solution: Vérifier les limites de taille dans les buckets
avatars: 2MB
portfolios: 5MB
documents: 10MB
project-photos: 5MB
```

### Upload fonctionne mais photo n'apparaît pas
```
Solution: Vérifier que le bucket est public (pour avatars/portfolios)
Vérifier l'URL retournée par getPublicUrl()
```

---

## 🎯 Prochaines étapes après configuration

Une fois le storage configuré:

1. ✅ Tester upload avatar dans AddArtisanModal
2. ✅ Ajouter upload portfolio dans ArtisanDashboard
3. ✅ Ajouter upload documents certifications
4. ✅ Ajouter upload photos projets
5. ✅ Monitorer l'utilisation du storage

---

## 📝 Notes importantes

- Les buckets public vs privé:
  - **Public**: URL accessible sans auth (avatars, portfolios)
  - **Private**: Nécessite auth + permissions (documents, project-photos)

- Organisation des fichiers:
  - Toujours dans des dossiers par user_id ou contract_id
  - Format: `{bucket}/{id}/{timestamp}.{ext}`

- Nettoyage:
  - Penser à supprimer les fichiers obsolètes
  - Implémenter une routine de nettoyage si nécessaire

---

**Le code est 100% prêt. Il ne reste que la configuration manuelle des buckets!** 🚀
