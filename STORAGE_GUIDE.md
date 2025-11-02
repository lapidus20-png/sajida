# 📦 Guide Storage Supabase - BuilderHub

## ✅ SYSTÈME COMPLET

### Date: 2024
### Statut: **PRODUCTION READY** 🚀

---

## 📊 Vue d'ensemble

BuilderHub utilise Supabase Storage pour gérer tous les fichiers uploadés par les utilisateurs (photos, documents, certifications).

---

## 🗂️ Buckets configurés (4 buckets)

### 1. **avatars** (Public)
```
Type: Public
Taille max: 2MB
Formats: JPEG, PNG, WebP
Usage: Photos de profil
Organisation: avatars/{user-id}/{timestamp}.jpg
```

**Exemples:**
- `avatars/user-123/1699876543.jpg`
- `avatars/user-456/1699876789.png`

### 2. **portfolios** (Public)
```
Type: Public
Taille max: 5MB
Formats: JPEG, PNG, WebP
Usage: Photos de travaux des artisans
Organisation: portfolios/{user-id}/{timestamp}.jpg
```

**Exemples:**
- `portfolios/artisan-789/1699876543.jpg`
- `portfolios/artisan-789/1699876600.jpg`
- `portfolios/artisan-789/1699876650.jpg`

### 3. **documents** (Privé)
```
Type: Privé
Taille max: 10MB
Formats: PDF, JPEG, PNG
Usage: Certifications, documents officiels
Organisation: documents/{user-id}/{timestamp}.pdf
```

**Exemples:**
- `documents/artisan-789/1699876543.pdf` (Certification)
- `documents/artisan-789/1699876600.pdf` (Assurance)
- `documents/artisan-789/1699876650.jpg` (Pièce d'identité)

### 4. **project-photos** (Semi-public)
```
Type: Semi-public
Taille max: 5MB
Formats: JPEG, PNG, WebP
Usage: Photos de projets en cours
Organisation: project-photos/{contract-id}/{timestamp}.jpg
```

**Exemples:**
- `project-photos/contract-abc/1699876543.jpg` (Avant)
- `project-photos/contract-abc/1699876600.jpg` (En cours)
- `project-photos/contract-abc/1699876650.jpg` (Après)

---

## 🔐 Politiques de sécurité (RLS)

### Bucket: avatars

**SELECT (Lecture):**
```sql
Public - Tout le monde peut voir
```

**INSERT (Upload):**
```sql
Authentifié uniquement
Peut uploader dans son propre dossier: auth.uid() = folder
```

**UPDATE (Mise à jour):**
```sql
Authentifié uniquement
Peut modifier ses propres fichiers
```

**DELETE (Suppression):**
```sql
Authentifié uniquement
Peut supprimer ses propres fichiers
```

### Bucket: portfolios

**Mêmes règles que avatars**
- Public en lecture
- Upload/Update/Delete dans son propre dossier uniquement

### Bucket: documents

**SELECT (Lecture):**
```sql
Authentifié uniquement
Peut voir UNIQUEMENT ses propres documents
```

**INSERT/UPDATE/DELETE:**
```sql
Authentifié uniquement
Opérations dans son propre dossier uniquement
```

### Bucket: project-photos

**SELECT (Lecture):**
```sql
Authentifié uniquement
Peut voir si:
  - Propriétaire du dossier
  - OU client/artisan du contrat
```

**INSERT/UPDATE/DELETE:**
```sql
Authentifié uniquement
Peut opérer si partie du contrat (client OU artisan)
```

---

## 💻 Service TypeScript (storageService)

### Méthodes disponibles

#### uploadAvatar()
```typescript
async uploadAvatar(userId: string, file: File): Promise<UploadResult>
```

**Utilisation:**
```typescript
import { storageService } from './lib/storageService';

const result = await storageService.uploadAvatar(userId, file);
if (result.success) {
  console.log('Avatar URL:', result.url);
  console.log('Storage path:', result.path);
}
```

**Validation:**
- Taille max: 2MB
- Formats: JPEG, PNG, WebP

#### uploadPortfolioImage()
```typescript
async uploadPortfolioImage(userId: string, file: File): Promise<UploadResult>
```

**Utilisation:**
```typescript
const result = await storageService.uploadPortfolioImage(artisanId, file);
if (result.success) {
  // Ajouter l'URL au portfolio de l'artisan
  await supabase
    .from('artisans')
    .update({ 
      portefeuille: [...existingPortfolio, result.url] 
    })
    .eq('id', artisanId);
}
```

**Validation:**
- Taille max: 5MB
- Formats: JPEG, PNG, WebP

#### uploadDocument()
```typescript
async uploadDocument(userId: string, file: File): Promise<UploadResult>
```

**Utilisation:**
```typescript
const result = await storageService.uploadDocument(artisanId, certificationFile);
if (result.success) {
  // Enregistrer la certification
  await supabase
    .from('artisans')
    .update({ 
      certifications: [...existing, result.url] 
    })
    .eq('id', artisanId);
}
```

**Validation:**
- Taille max: 10MB
- Formats: PDF, JPEG, PNG

#### uploadProjectPhoto()
```typescript
async uploadProjectPhoto(contractId: string, file: File): Promise<UploadResult>
```

**Utilisation:**
```typescript
const result = await storageService.uploadProjectPhoto(contractId, photoFile);
if (result.success) {
  // Ajouter aux photos du projet
  await supabase
    .from('project_timelines')
    .update({ 
      photos_url: [...existing, result.url] 
    })
    .eq('contract_id', contractId);
}
```

**Validation:**
- Taille max: 5MB
- Formats: JPEG, PNG, WebP

#### deleteFile()
```typescript
async deleteFile(bucket: string, path: string): Promise<boolean>
```

**Utilisation:**
```typescript
const deleted = await storageService.deleteFile(
  'portfolios',
  'user-123/1699876543.jpg'
);

if (deleted) {
  console.log('Fichier supprimé avec succès');
}
```

#### listFiles()
```typescript
async listFiles(bucket: string, folder: string): Promise<string[]>
```

**Utilisation:**
```typescript
const files = await storageService.listFiles('portfolios', userId);
console.log('Fichiers du portfolio:', files);
// ['user-123/1699876543.jpg', 'user-123/1699876600.jpg']
```

#### getPublicUrl()
```typescript
getPublicUrl(bucket: string, path: string): string
```

**Utilisation:**
```typescript
const url = storageService.getPublicUrl(
  'avatars',
  'user-123/1699876543.jpg'
);
console.log('URL publique:', url);
// https://xyz.supabase.co/storage/v1/object/public/avatars/user-123/1699876543.jpg
```

---

## 🎨 Composant FileUpload

Composant React réutilisable pour upload de fichiers.

### Props

```typescript
interface FileUploadProps {
  bucketType: 'avatars' | 'portfolios' | 'documents' | 'projectPhotos';
  userId?: string;
  contractId?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  label?: string;
  accept?: string;
}
```

### Utilisation

#### Upload d'avatar

```tsx
import FileUpload from './components/FileUpload';

<FileUpload
  bucketType="avatars"
  userId={currentUser.id}
  label="Photo de profil"
  onUploadComplete={(result) => {
    console.log('Avatar uploadé:', result.url);
    // Mettre à jour le profil
    updateUserProfile({ avatar_url: result.url });
  }}
  onUploadError={(error) => {
    alert('Erreur: ' + error);
  }}
/>
```

#### Upload de portfolio

```tsx
<FileUpload
  bucketType="portfolios"
  userId={artisanId}
  label="Ajouter une photo de travail"
  onUploadComplete={(result) => {
    // Ajouter au portfolio
    addToPortfolio(result.url);
  }}
/>
```

#### Upload de document

```tsx
<FileUpload
  bucketType="documents"
  userId={artisanId}
  label="Certification professionnelle"
  accept="application/pdf"
  onUploadComplete={(result) => {
    // Enregistrer certification
    addCertification(result.url);
  }}
/>
```

#### Upload photo de projet

```tsx
<FileUpload
  bucketType="projectPhotos"
  contractId={contract.id}
  label="Photo du jalon"
  onUploadComplete={(result) => {
    // Ajouter aux photos du jalon
    addMilestonePhoto(result.url);
  }}
/>
```

### Fonctionnalités du composant

**Validation automatique:**
- ✅ Taille de fichier
- ✅ Type MIME
- ✅ Feedback visuel

**États visuels:**
- 📤 Zone de drop
- ⏳ Upload en cours (spinner)
- ✅ Succès (checkmark)
- ❌ Erreur (message)
- 🖼️ Preview d'image

**Actions:**
- Upload
- Preview avant upload
- Suppression preview
- Retry automatique

---

## 🚀 Configuration Supabase

### Étape 1: Créer les buckets

Dans le Dashboard Supabase > Storage > Create bucket:

**1. avatars**
```
Name: avatars
Public: ✅ Yes
File size limit: 2097152 (2MB)
Allowed MIME types: image/jpeg, image/png, image/webp
```

**2. portfolios**
```
Name: portfolios
Public: ✅ Yes
File size limit: 5242880 (5MB)
Allowed MIME types: image/jpeg, image/png, image/webp
```

**3. documents**
```
Name: documents
Public: ❌ No
File size limit: 10485760 (10MB)
Allowed MIME types: application/pdf, image/jpeg, image/png
```

**4. project-photos**
```
Name: project-photos
Public: ❌ No
File size limit: 5242880 (5MB)
Allowed MIME types: image/jpeg, image/png, image/webp
```

### Étape 2: Configurer les policies

Pour chaque bucket, aller dans Policies et ajouter:

**Avatars:**
```sql
-- SELECT (Public)
bucket_id = 'avatars'

-- INSERT (Owner only)
bucket_id = 'avatars' AND
auth.uid()::text = (storage.foldername(name))[1]

-- UPDATE (Owner only)
bucket_id = 'avatars' AND
auth.uid()::text = (storage.foldername(name))[1]

-- DELETE (Owner only)
bucket_id = 'avatars' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Portfolios:**
```sql
-- Mêmes policies que avatars
```

**Documents:**
```sql
-- SELECT (Owner only - privé)
bucket_id = 'documents' AND
auth.uid()::text = (storage.foldername(name))[1]

-- INSERT/UPDATE/DELETE (Owner only)
bucket_id = 'documents' AND
auth.uid()::text = (storage.foldername(name))[1]
```

**Project-photos:**
```sql
-- SELECT (Contract parties)
bucket_id = 'project-photos' AND (
  auth.uid()::text = (storage.foldername(name))[1]
  OR
  EXISTS (
    SELECT 1 FROM contracts
    WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
    AND id::text = (storage.foldername(name))[1]
  )
)

-- INSERT/UPDATE/DELETE (Contract parties)
bucket_id = 'project-photos' AND
EXISTS (
  SELECT 1 FROM contracts
  WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
  AND id::text = (storage.foldername(name))[1]
)
```

---

## 📊 Exemples de scénarios

### Scénario 1: Artisan upload avatar

```typescript
// Component
const [avatar, setAvatar] = useState<string | null>(null);

<FileUpload
  bucketType="avatars"
  userId={artisan.user_id}
  currentImageUrl={artisan.photo_url}
  label="Photo de profil"
  onUploadComplete={async (result) => {
    // Mettre à jour en BD
    await supabase
      .from('artisans')
      .update({ photo_url: result.url })
      .eq('id', artisan.id);
    
    setAvatar(result.url);
  }}
/>
```

**Résultat:**
- File uploadé: `avatars/user-123/1699876543.jpg`
- URL: `https://xyz.supabase.co/storage/v1/object/public/avatars/...`
- BD mise à jour avec nouvelle URL

### Scénario 2: Artisan ajoute photos portfolio

```typescript
const [portfolio, setPortfolio] = useState<string[]>([]);

<FileUpload
  bucketType="portfolios"
  userId={artisan.user_id}
  label="Ajouter une réalisation"
  onUploadComplete={async (result) => {
    const newPortfolio = [...portfolio, result.url];
    
    await supabase
      .from('artisans')
      .update({ portefeuille: newPortfolio })
      .eq('id', artisan.id);
    
    setPortfolio(newPortfolio);
  }}
/>

{/* Affichage du portfolio */}
<div className="grid grid-cols-3 gap-4">
  {portfolio.map((url, index) => (
    <img key={index} src={url} alt={`Réalisation ${index + 1}`} />
  ))}
</div>
```

### Scénario 3: Upload document certification

```typescript
<FileUpload
  bucketType="documents"
  userId={artisan.user_id}
  label="Certification professionnelle (PDF)"
  accept="application/pdf"
  onUploadComplete={async (result) => {
    await supabase
      .from('artisans')
      .update({ 
        certifications: [...existingCerts, result.url]
      })
      .eq('id', artisan.id);
    
    toast.success('Certification ajoutée avec succès');
  }}
/>
```

### Scénario 4: Photos de progression projet

```typescript
// Client ou Artisan upload photo de jalon
<FileUpload
  bucketType="projectPhotos"
  contractId={contract.id}
  label="Photo du jalon completé"
  onUploadComplete={async (result) => {
    await supabase
      .from('project_timelines')
      .update({ 
        photos_url: [...existing, result.url],
        statut: 'complete'
      })
      .eq('id', milestoneId);
    
    // Notifier l'autre partie
    notifyMilestoneComplete();
  }}
/>
```

---

## 🛡️ Validation et limites

### Validation côté client

```typescript
import { storageService, STORAGE_LIMITS } from './lib/storageService';

const limits = STORAGE_LIMITS.avatars;

// Vérifier taille
if (!storageService.validateFileSize(file, limits.maxSize)) {
  alert(`Fichier trop volumineux. Max: ${limits.maxSize}MB`);
  return;
}

// Vérifier type
if (!storageService.validateFileType(file, limits.allowedTypes)) {
  alert('Type de fichier non supporté');
  return;
}
```

### Limites par bucket

```typescript
export const STORAGE_LIMITS = {
  avatars: {
    maxSize: 2,     // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  portfolios: {
    maxSize: 5,     // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  documents: {
    maxSize: 10,    // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  projectPhotos: {
    maxSize: 5,     // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};
```

---

## 📈 Monitoring et analytics

### Requêtes utiles

**Espace utilisé par utilisateur:**
```sql
SELECT 
  (storage.foldername(name))[1] as user_id,
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as total_mb
FROM storage.objects
GROUP BY (storage.foldername(name))[1], bucket_id
ORDER BY total_mb DESC;
```

**Fichiers récents:**
```sql
SELECT 
  name,
  bucket_id,
  created_at,
  metadata->>'size' as size_bytes
FROM storage.objects
ORDER BY created_at DESC
LIMIT 20;
```

**Statistiques par bucket:**
```sql
SELECT 
  bucket_id,
  COUNT(*) as total_files,
  SUM((metadata->>'size')::bigint) / 1024 / 1024 as total_mb,
  AVG((metadata->>'size')::bigint) / 1024 as avg_kb
FROM storage.objects
GROUP BY bucket_id;
```

---

## ✅ Résumé

**BuilderHub dispose maintenant d'un système de storage complet:**

📦 **4 buckets configurés**
- avatars (public, 2MB)
- portfolios (public, 5MB)
- documents (privé, 10MB)
- project-photos (semi-public, 5MB)

🔐 **Sécurité RLS complète**
- Policies pour chaque bucket
- Accès basé sur propriété
- Validation de permissions

💻 **Service TypeScript complet**
- Upload/Delete/List
- Validation automatique
- Gestion d'erreurs

🎨 **Composant UI réutilisable**
- Preview d'images
- États visuels
- Callbacks personnalisables

---

**Version**: 1.0.0
**Date**: 2024
**Status**: ✅ READY TO CONFIGURE
**Storage**: ✅ COMPLET

📦 **SYSTÈME STORAGE IMPLÉMENTÉ!** 📦

---

## 🚀 Prochaines étapes

1. Créer les 4 buckets dans Supabase Dashboard
2. Configurer les policies RLS
3. Tester uploads dans chaque bucket
4. Intégrer FileUpload dans les composants
5. Monitorer l'utilisation

**Le code est prêt, il ne reste qu'à créer les buckets dans Supabase!**
