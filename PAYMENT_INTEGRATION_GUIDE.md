# Guide d'Intégration des Paiements Mobiles

## Vue d'ensemble

Ce guide vous explique comment configurer et tester les intégrations de paiement mobile pour le Burkina Faso : Orange Money, Moov Money, Wave, et Telecel Money.

## Architecture

```
┌─────────────────┐
│  Client React   │ → Demande de paiement
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Supabase Edge Function  │ → Traitement sécurisé
│  process-payment        │    avec clés API
└────────┬────────────────┘
         │
         ▼
┌────────────────────────────┐
│ API Mobile Money Provider  │ → Orange, Moov, Wave, Telecel
└────────────────────────────┘
```

## Étape 1 : Obtenir les Clés API

### Orange Money Burkina Faso

**Sandbox (Test)**
1. Créez un compte sur https://developer.orange.com
2. Souscrivez à l'API "Orange Money Burkina Faso"
3. Récupérez votre API Key et Merchant Key sandbox
4. Documentation : https://developer.orange.com/apis/orange-money-bf/

**Production**
- Contactez Orange Business Services Burkina
- Validez votre contrat marchand
- Obtenez vos clés de production après validation

**Numéros de test** : 70XXXXXX (Orange BF)
**Montants de test** : 100 - 10,000 FCFA
**Code PIN test** : 1234

---

### Moov Money Burkina Faso

**Sandbox (Test)**
1. Contactez : commercial@moov-africa.bf
2. Téléphone : +226 76 00 00 00
3. Demandez l'accès API sandbox
4. Recevez votre API Key test

**Production**
- Signez le contrat marchand
- Fournissez les documents d'entreprise
- Obtenez vos clés de production

**Numéros de test** : 60XXXXXX (Moov BF)
**Code OTP test** : 123456

---

### Wave

**Sandbox (Test)**
1. Créez un compte sur https://developer.wave.com
2. Accédez au Dashboard développeur
3. Créez une application
4. Récupérez votre API Key sandbox
5. Documentation : https://docs.wave.com

**Production**
- Complétez la vérification KYC
- Activez le compte marchand
- Basculez vers les clés de production

**Numéros de test** : 77XXXXXX (Wave)
**Environnement** : https://test.wave.com

---

### Telecel Money (ex-Telmob)

**Sandbox (Test)**
1. Contactez Telecel Burkina : +226 78 00 00 00
2. Email : support@telecel.bf
3. Demandez l'API Telecel Money sandbox
4. Recevez API Key + Merchant ID

**Production**
- Contrat marchand Telecel
- Validation commerciale
- Activation du compte production

**Numéros de test** : 78XXXXXX (Telecel)
**Validation** : *123# sur le mobile

---

## Étape 2 : Configuration du Projet

### 2.1 Variables d'Environnement (Frontend)

Copiez `.env.example` vers `.env` et remplissez :

```bash
# Orange Money
VITE_ORANGE_MONEY_API_KEY=votre_cle_sandbox
VITE_ORANGE_MONEY_MERCHANT_KEY=votre_merchant_key_sandbox

# Moov Money
VITE_MOOV_MONEY_API_KEY=votre_cle_sandbox

# Wave
VITE_WAVE_API_KEY=votre_cle_sandbox

# Telecel Money
VITE_TELECEL_MONEY_API_KEY=votre_cle_sandbox
VITE_TELECEL_MONEY_MERCHANT_ID=votre_merchant_id_sandbox
```

### 2.2 Secrets Supabase (Backend)

Les clés API réelles doivent être configurées dans Supabase :

```bash
# Allez dans Supabase Dashboard > Settings > Edge Functions > Secrets
# Ajoutez ces secrets :

ORANGE_MONEY_API_KEY=votre_vraie_cle
ORANGE_MONEY_MERCHANT_KEY=votre_vraie_merchant_key
MOOV_MONEY_API_KEY=votre_vraie_cle
WAVE_API_KEY=votre_vraie_cle
TELECEL_MONEY_API_KEY=votre_vraie_cle
TELECEL_MONEY_MERCHANT_ID=votre_vrai_merchant_id
```

**Important** : Les clés `VITE_*` sont pour la validation côté client uniquement. Les vraies transactions utilisent les secrets Supabase.

---

## Étape 3 : Tester l'Intégration

### 3.1 Mode Simulation (Sans API)

Le composant `PaymentTestPanel` permet de tester sans vraies API :

```typescript
import PaymentTestPanel from './components/PaymentTestPanel';

// Dans votre dashboard admin
<PaymentTestPanel />
```

1. Sélectionnez un fournisseur
2. Entrez un numéro de test
3. Montant : 1000 FCFA (exemple)
4. Cochez "Mode Simulation"
5. Cliquez "Tester le paiement"

**Résultat** : Transaction simulée instantanément

### 3.2 Mode Sandbox (Avec vraies API)

1. Ajoutez vos clés sandbox dans `.env`
2. Déployez la edge function :
   ```bash
   # Les edge functions sont déjà déployées
   # Ajoutez juste les secrets dans Supabase Dashboard
   ```
3. Décochez "Mode Simulation"
4. Testez avec les numéros fournis par les opérateurs

---

## Étape 4 : Utilisation dans l'Application

### 4.1 Composant de Paiement

```typescript
import { paymentService } from '../lib/paymentService';

const handlePayment = async () => {
  const result = await paymentService.processPayment('orange_money', {
    amount: 5000,
    phone: '70123456',
    reference: `ORDER_${Date.now()}`,
    description: 'Paiement pour service X',
    customerName: 'Client Nom',
  });

  if (result.success) {
    console.log('Transaction ID:', result.transactionId);
    // Rediriger vers checkoutUrl si fourni (Wave, Orange)
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    }
  } else {
    console.error('Erreur:', result.error);
  }
};
```

### 4.2 Vérification de Statut

```typescript
const status = await paymentService.checkPaymentStatus(transactionId);

switch (status.status) {
  case 'complete':
    // Paiement réussi
    break;
  case 'en_attente':
    // En attente de confirmation
    break;
  case 'echoue':
    // Paiement échoué
    break;
}
```

---

## Étape 5 : Webhooks

Les webhooks permettent de recevoir les notifications de paiement :

**URL webhook** : `https://YOUR_PROJECT.supabase.co/functions/v1/payment-webhook`

Cette fonction est déjà configurée pour :
- Recevoir les notifications Orange Money
- Recevoir les callbacks Moov Money
- Gérer les confirmations Wave
- Traiter les retours Telecel Money

Les webhooks mettent automatiquement à jour la table `transactions`.

---

## Étape 6 : Passage en Production

### Checklist de Production

- [ ] Obtenir les clés de production de chaque opérateur
- [ ] Remplacer les secrets sandbox par les clés production dans Supabase
- [ ] Tester avec de petits montants réels
- [ ] Configurer les webhooks en production
- [ ] Activer les notifications clients
- [ ] Mettre en place la surveillance des transactions
- [ ] Documenter les procédures de remboursement

### URLs de Production

- **Orange Money** : https://api.orange.com/orange-money-webpay/bf/v1/
- **Moov Money** : https://api.moov-africa.bf/v1/
- **Wave** : https://api.wave.com/v1/
- **Telecel Money** : https://api.telecel.bf/v1/

---

## Dépannage

### Erreur : "Configuration manquante"

**Cause** : Clés API non configurées

**Solution** :
1. Vérifiez que les secrets sont dans Supabase Dashboard
2. Vérifiez que `.env` contient les variables `VITE_*`
3. Redémarrez le serveur de développement

### Erreur : "Erreur de connexion"

**Cause** : API non accessible ou URL incorrecte

**Solution** :
1. Vérifiez votre connexion internet
2. Confirmez que vous êtes en mode sandbox
3. Vérifiez les URLs dans `supabase/functions/process-payment/index.ts`

### Paiement bloqué à "en_attente"

**Cause** : Client n'a pas confirmé ou webhook non reçu

**Solution** :
1. Vérifiez que le client a bien confirmé sur son téléphone
2. Attendez 2-3 minutes (timeout normal)
3. Consultez les logs Supabase Edge Functions
4. Vérifiez la table `transactions` directement

### Numéro de téléphone invalide

**Cause** : Format incorrect

**Solution** : Utilisez le format international
- ✅ Correct : `22670123456` ou `70123456`
- ❌ Incorrect : `+226 70 12 34 56` ou `070123456`

---

## Support

### Documentation Officielle

- **Orange Money BF** : https://developer.orange.com/apis/orange-money-bf/
- **Moov Money** : Contactez commercial@moov-africa.bf
- **Wave** : https://docs.wave.com
- **Telecel** : Contactez +226 78 00 00 00

### Support Technique

Pour les problèmes techniques avec cette intégration :
1. Consultez les logs Supabase
2. Vérifiez la table `transactions`
3. Testez avec le `PaymentTestPanel`
4. Examinez les réponses dans la console navigateur

---

## Sécurité

### ✅ Bonnes Pratiques

- Ne jamais exposer les clés API dans le frontend
- Toujours valider les montants côté serveur
- Logger toutes les transactions
- Implémenter des limites de montant
- Utiliser HTTPS uniquement
- Vérifier les signatures webhook

### ❌ À Éviter

- Stocker les clés dans le code source
- Traiter les paiements uniquement côté client
- Faire confiance aux montants envoyés par le client
- Négliger la validation des webhooks
- Utiliser des clés de production en développement

---

## Limites et Frais

### Orange Money
- **Montant min** : 100 FCFA
- **Montant max** : 5,000,000 FCFA
- **Frais** : Variable selon le montant (négocié)

### Moov Money
- **Montant min** : 100 FCFA
- **Montant max** : 2,000,000 FCFA
- **Frais** : Selon le contrat marchand

### Wave
- **Montant min** : 100 FCFA
- **Montant max** : 1,000,000 FCFA
- **Frais** : 1% (généralement les plus bas)

### Telecel Money
- **Montant min** : 100 FCFA
- **Montant max** : 1,500,000 FCFA
- **Frais** : Selon le contrat marchand

---

## Prochaines Étapes

1. ✅ Testez en mode simulation
2. ✅ Obtenez les clés sandbox
3. ✅ Testez en mode sandbox
4. ⬜ Validez avec de vrais utilisateurs test
5. ⬜ Obtenez les clés de production
6. ⬜ Déployez en production
7. ⬜ Surveillez les transactions

**Bon développement ! 🚀**
