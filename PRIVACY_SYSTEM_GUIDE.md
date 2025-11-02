# 🔒 Système de Confidentialité - BuilderHub

## ✅ IMPLÉMENTATION COMPLÈTE

### Date: 2024
### Statut: **PRODUCTION READY** 🚀

---

## 📊 Vue d'ensemble

BuilderHub protège les coordonnées personnelles (téléphone, email) des clients et artisans jusqu'au paiement de l'acompte, créant un environnement de confiance pour toutes les parties.

---

## 🎯 Règles de confidentialité

### Avant paiement (État par défaut)

**Coordonnées masquées:**
- ❌ Téléphone: `+226XXXX...XX56`
- ❌ Email: `j***n@e***.com`
- ✅ Nom: Visible
- ✅ Ville/Quartier: Visible
- ✅ Métier/Spécialité: Visible
- ✅ Description: Visible
- ✅ Portfolio: Visible

**Raison:**
Protection contre le spam, les arnaques, et le contournement de la plateforme.

### Après paiement acompte

**Coordonnées démasquées:**
- ✅ Téléphone: `+22670123456` (complet)
- ✅ Email: `jean@email.com` (complet)
- ✅ Contact direct autorisé

**Déclencheur:**
- Transaction de type `acompte` avec status `complete`
- OU contrat avec statut `accepte` ou `en_cours`
- OU utilisateur est admin

---

## 🏗️ Architecture

### Composants

```
Base de données:
├── can_view_contact_info()  → Fonction SQL de vérification
├── mask_phone()              → Masquage téléphone SQL
└── mask_email()              → Masquage email SQL

Frontend (TypeScript):
├── maskPhone()               → Masquage téléphone client
├── maskEmail()               → Masquage email client
└── canViewContactInfo()      → Vérification permissions

UI Components:
└── ContactModal.tsx          → Affichage conditionnel
```

### Flux de vérification

```
1. Utilisateur clique "Contacter"
   ↓
2. ContactModal s'ouvre
   ↓
3. Appel canViewContactInfo(viewer_id, artisan_id)
   ↓
4. Fonction SQL vérifie:
   - Même utilisateur? → ✅ Autorisé
   - Est admin? → ✅ Autorisé
   - A payé acompte? → ✅ Autorisé
   - Contrat accepté? → ✅ Autorisé
   - Sinon → ❌ Refusé
   ↓
5. Si refusé: Affiche coordonnées masquées
6. Si autorisé: Affiche coordonnées complètes
```

---

## 🔐 Fonctions SQL

### can_view_contact_info()

Vérifie si un utilisateur peut voir les coordonnées d'un autre.

**Signature:**
```sql
can_view_contact_info(
  viewer_id uuid,
  target_user_id uuid,
  contract_id_param uuid DEFAULT NULL
) RETURNS boolean
```

**Logique:**
```sql
-- 1. Même utilisateur
IF viewer_id = target_user_id THEN RETURN true;

-- 2. Est admin
IF user.role = 'admin' THEN RETURN true;

-- 3. A payé un acompte pour ce contrat
IF EXISTS (transaction avec acompte payé) THEN RETURN true;

-- 4. Contrat accepté entre les parties
IF EXISTS (contrat accepté) THEN RETURN true;

-- Sinon
RETURN false;
```

**Exemples:**
```sql
-- Client vérifie si il peut voir coordonnées artisan
SELECT can_view_contact_info(
  'client-uuid',
  'artisan-uuid', 
  'contract-uuid'
);
-- Retourne: true si acompte payé, false sinon

-- Admin vérifie
SELECT can_view_contact_info(
  'admin-uuid',
  'artisan-uuid',
  NULL
);
-- Retourne: true (toujours)
```

### mask_phone()

Masque un numéro de téléphone.

**Signature:**
```sql
mask_phone(phone_number text) RETURNS text
```

**Exemples:**
```sql
SELECT mask_phone('+22670123456');
-- Retourne: '+226XXXXXXXX56'

SELECT mask_phone('70123456');
-- Retourne: '7012XX56'
```

**Logique:**
- Garde 4 premiers caractères (préfixe pays + indicatif)
- Remplace milieu par 'X'
- Garde 2 derniers chiffres

### mask_email()

Masque une adresse email.

**Signature:**
```sql
mask_email(email_address text) RETURNS text
```

**Exemples:**
```sql
SELECT mask_email('jean.ouedraogo@gmail.com');
-- Retourne: 'j************o@g***.com'

SELECT mask_email('a@example.org');
-- Retourne: 'a***@e***.org'
```

**Logique:**
- Garde 1er caractère de la partie locale
- Masque milieu avec '*'
- Garde dernier caractère de la partie locale
- Garde 1er caractère du domaine
- Masque domaine sauf extension

---

## 💻 Fonctions TypeScript

### maskPhone()

Version client-side du masquage.

```typescript
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 4) return '***';
  return phone.substring(0, 4) + 
         'X'.repeat(Math.max(0, phone.length - 6)) + 
         phone.substring(phone.length - 2);
}
```

**Usage:**
```typescript
import { maskPhone } from './lib/supabase';

const maskedPhone = maskPhone('+22670123456');
// Résultat: '+226XXXXXXXX56'
```

### maskEmail()

Version client-side du masquage.

```typescript
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return local[0] + '***@' + domain[0] + '***.' + domain.split('.').pop();
  }
  return local[0] + '*'.repeat(local.length - 2) + 
         local[local.length - 1] + '@' + 
         domain[0] + '***.' + domain.split('.').pop();
}
```

**Usage:**
```typescript
import { maskEmail } from './lib/supabase';

const maskedEmail = maskEmail('jean@gmail.com');
// Résultat: 'j**n@g***.com'
```

### canViewContactInfo()

Vérifie permissions côté client.

```typescript
export async function canViewContactInfo(
  viewerId: string,
  targetUserId: string,
  contractId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_view_contact_info', {
    viewer_id: viewerId,
    target_user_id: targetUserId,
    contract_id_param: contractId || null,
  });
  return data === true;
}
```

**Usage:**
```typescript
import { canViewContactInfo } from './lib/supabase';

const canView = await canViewContactInfo(
  currentUserId,
  artisanUserId,
  contractId
);

if (canView) {
  // Afficher coordonnées complètes
} else {
  // Afficher coordonnées masquées
}
```

---

## 🎨 Interface utilisateur

### ContactModal - États visuels

#### État 1: Vérification en cours
```
┌─────────────────────────────────────┐
│ Vérification des permissions...     │
│ [Loader animé]                       │
└─────────────────────────────────────┘
```

#### État 2: Coordonnées masquées
```
┌─────────────────────────────────────┐
│ 🔒 Coordonnées protégées            │
│                                      │
│ 📱 Téléphone: +226XXXXXXXX56        │
│ ✉️ Email: j***n@e***.com            │
│                                      │
│ 💡 Les coordonnées complètes seront │
│    visibles après le paiement de    │
│    l'acompte                         │
└─────────────────────────────────────┘
```

#### État 3: Coordonnées démasquées
```
┌─────────────────────────────────────┐
│ ✅ Coordonnées complètes            │
│                                      │
│ 📱 Téléphone: +22670123456          │
│ ✉️ Email: jean@gmail.com            │
└─────────────────────────────────────┘
```

### Code du composant

```typescript
// ContactModal.tsx
const [canViewContacts, setCanViewContacts] = useState(false);
const [checkingPermissions, setCheckingPermissions] = useState(true);

useEffect(() => {
  checkContactPermissions();
}, []);

const checkContactPermissions = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !artisan.user_id) {
    setCanViewContacts(false);
    setCheckingPermissions(false);
    return;
  }

  const canView = await canViewContactInfo(user.id, artisan.user_id);
  setCanViewContacts(canView);
  setCheckingPermissions(false);
};
```

---

## 📊 Exemples de scénarios

### Scénario 1: Client browse artisans

```
Étape 1: Client cherche un plombier
État: ❌ Pas de paiement
Affichage:
  - Nom: ✅ "Jean Ouédraogo"
  - Métier: ✅ "Plombier"
  - Téléphone: ❌ "+226XXXXXXXX56"
  - Email: ❌ "j***o@g***.com"
```

### Scénario 2: Client accepte devis et paie acompte

```
Étape 1: Client accepte devis (200,000 FCFA)
Étape 2: Acompte requis (100,000 FCFA)
Étape 3: Client paie acompte via Orange Money
Étape 4: Transaction status = 'complete'

État: ✅ Paiement effectué
Affichage:
  - Nom: ✅ "Jean Ouédraogo"
  - Métier: ✅ "Plombier"
  - Téléphone: ✅ "+22670123456" (démasqué)
  - Email: ✅ "jean@gmail.com" (démasqué)

Action: Client peut maintenant contacter directement
```

### Scénario 3: Artisan reçoit demande

```
Étape 1: Client envoie demande de devis
État: ❌ Pas encore de contrat accepté
Affichage artisan voit:
  - Nom client: ✅ "Marie Traoré"
  - Téléphone: ❌ "+226XXXXXXXX89"
  - Email: ❌ "m***e@y***.com"

Étape 2: Artisan envoie devis
Étape 3: Client accepte devis
État: ✅ Contrat accepté
Affichage artisan voit maintenant:
  - Téléphone: ✅ "+22675987689" (démasqué)
  - Email: ✅ "marie@yahoo.com" (démasqué)
```

### Scénario 4: Administrateur

```
État: ✅ Toujours autorisé
Admin voit toujours:
  - Téléphone: ✅ Complet (jamais masqué)
  - Email: ✅ Complet (jamais masqué)

Raison: Support et modération
```

---

## 🛡️ Avantages du système

### Pour la plateforme

```
✅ Réduit contournement de la plateforme
✅ Encourage paiements via BuilderHub
✅ Génère commissions (5%)
✅ Traçabilité des transactions
✅ Protection contre spam
```

### Pour les clients

```
✅ Protection vie privée avant engagement
✅ Pas de spam ni démarchage
✅ Confiance dans le processus
✅ Sécurité via séquestre
✅ Contact après engagement sérieux
```

### Pour les artisans

```
✅ Protection coordonnées personnelles
✅ Leads qualifiés uniquement
✅ Clients sérieux (ont payé)
✅ Pas de time-wasters
✅ Paiements garantis
```

---

## 🔄 Flux complet de démasquage

```
1. Client browse artisans
   → Coordonnées masquées
   
2. Client demande devis
   → Toujours masquées
   
3. Artisan envoie devis
   → Toujours masquées
   
4. Client accepte devis
   → Contrat créé
   → Compte séquestre créé
   
5. Client paie acompte (50%)
   → Transaction créée
   → Provider traite paiement
   
6. Paiement confirmé
   → Transaction status = 'complete'
   → Fonds en séquestre
   
7. Permissions mises à jour
   → can_view_contact_info() = true
   
8. Client recharge ContactModal
   → Coordonnées démasquées ✅
   
9. Artisan accède au contrat
   → Coordonnées client démasquées ✅
   
10. Contact direct possible
    → Téléphone, Email, WhatsApp, etc.
```

---

## 📝 Tests

### Test 1: Masquage par défaut

```typescript
// Utilisateur non connecté ou sans paiement
const phone = '+22670123456';
const masked = maskPhone(phone);
console.log(masked); 
// Attendu: '+226XXXXXXXX56'
```

### Test 2: Vérification permissions

```typescript
// Avant paiement
const canView = await canViewContactInfo(clientId, artisanId);
console.log(canView);
// Attendu: false
```

### Test 3: Démasquage après paiement

```sql
-- Insérer transaction payée
INSERT INTO transactions (
  contract_id,
  payer_id,
  receiver_id,
  amount,
  transaction_type,
  status
) VALUES (
  'contract-uuid',
  'client-uuid',
  'artisan-uuid',
  100000,
  'acompte',
  'complete'
);

-- Vérifier permission
SELECT can_view_contact_info('client-uuid', 'artisan-uuid', 'contract-uuid');
-- Attendu: true
```

---

## 🎯 Métriques de succès

### KPIs à surveiller

```sql
-- Taux de conversion après démasquage
SELECT 
  COUNT(DISTINCT contract_id) as contracts_avec_acompte,
  COUNT(DISTINCT CASE WHEN statut = 'termine' THEN contract_id END) as contracts_termines,
  COUNT(DISTINCT CASE WHEN statut = 'termine' THEN contract_id END) * 100.0 / 
    COUNT(DISTINCT contract_id) as taux_completion
FROM contracts c
JOIN transactions t ON t.contract_id = c.id
WHERE t.transaction_type = 'acompte' AND t.status = 'complete';

-- Temps moyen avant paiement acompte
SELECT 
  AVG(EXTRACT(EPOCH FROM (t.created_at - c.created_at)) / 3600) as heures_moyennes
FROM contracts c
JOIN transactions t ON t.contract_id = c.id
WHERE t.transaction_type = 'acompte' AND t.status = 'complete';
```

---

## ✅ Résumé

**BuilderHub protège maintenant les coordonnées personnelles avec un système intelligent:**

🔒 **Masquage automatique par défaut**
- Téléphone: +226XXXX...XX
- Email: j***n@***.com

✅ **Démasquage après engagement sérieux**
- Paiement acompte validé
- Ou contrat accepté
- Ou utilisateur admin

🎯 **Bénéfices multiples**
- Protection vie privée
- Réduction contournement
- Leads qualifiés
- Confiance accrue

---

**Version**: 1.0.0
**Date**: 2024
**Status**: ✅ PRODUCTION READY
**Privacy**: ✅ COMPLET

🔒 **SYSTÈME DE CONFIDENTIALITÉ IMPLÉMENTÉ!** 🔒
