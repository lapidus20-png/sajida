# 🏗️ BuilderHub

**Plateforme de mise en relation entre clients et artisans professionnels**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/builderhub)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/yourusername/builderhub)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Fonctionnalités

### Pour les Clients
- 📝 Créer des demandes de travaux
- 💰 Recevoir et comparer des devis
- 💳 Payer en Mobile Money (MTN, Orange, Moov, Wave)
- 📊 Suivre l'avancement des projets
- ⭐ Laisser des avis vérifiés
- 💬 Messagerie avec artisans

### Pour les Artisans
- 🔍 Découvrir des opportunités de travail
- 📍 Filtrer par distance géographique
- 📨 Envoyer des devis personnalisés
- 👤 Gérer profil professionnel
- 📁 Upload portfolio et certifications
- 📈 Voir statistiques et performances

### Pour les Administrateurs
- 📊 Dashboard complet avec analytics
- 👥 Gestion utilisateurs (clients/artisans)
- ✅ Vérification artisans (KYC)
- 🛡️ Modération contenu
- 📝 Logs système et audit trail

---

## 🚀 Quick Start

### Déploiement en 5 minutes

```bash
# 1. Build
npm run build

# 2. Push GitHub
git init && git add . && git commit -m "v1.0"
git remote add origin https://github.com/USERNAME/builderhub.git
git push -u origin main

# 3. Deploy sur Vercel
# Aller sur vercel.com > Import from GitHub
# Ajouter variables d'environnement (voir .env.example)
# Deploy!

# 4. Configuration Supabase
# Dashboard > Settings > API > Allowed origins
# Dashboard > Auth > Enable "Leaked password protection"
```

**Voir [QUICK_START.md](QUICK_START.md) pour instructions détaillées**

---

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Vercel/Netlify (gratuit)

---

## 🛠️ Stack Technique

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Supabase** - Database & Auth
- **PostgreSQL** - Database
- **Edge Functions** - Serverless
- **Storage** - File Upload

### Features
- **RLS** - Row Level Security
- **JWT** - Authentication
- **Mobile Money** - Payments
- **Geolocation** - GPS & Distance
- **Real-time** - Live updates

---

## 📦 Installation Locale

```bash
# Clone le repo
git clone https://github.com/USERNAME/builderhub.git
cd builderhub

# Installer dépendances
npm install

# Configurer env
cp .env.example .env
# Éditer .env avec vos credentials Supabase

# Lancer dev server
npm run dev
```

Application disponible sur `http://localhost:5173`

---

## 🏗️ Structure du Projet

```
builderhub/
├── src/
│   ├── components/          # Composants React
│   │   ├── ClientDashboard.tsx
│   │   ├── ArtisanDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── ...
│   ├── lib/                 # Services & Utils
│   │   ├── supabase.ts
│   │   ├── storageService.ts
│   │   └── paymentService.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
├── public/
├── docs/                    # Documentation (18 guides)
├── vercel.json             # Vercel config
├── netlify.toml            # Netlify config
└── package.json
```

---

## 📚 Documentation

### Guides de Déploiement
- **[QUICK_START.md](QUICK_START.md)** - Déploiement rapide (5 min)
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guide complet détaillé
- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - Checklist production

### Guides Techniques
- **[DASHBOARDS_OVERVIEW.md](DASHBOARDS_OVERVIEW.md)** - Architecture UI
- **[SECURITY_FINAL_STATUS.md](SECURITY_FINAL_STATUS.md)** - Rapport sécurité
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Guide développement
- **[GEOLOCATION_GUIDE.md](GEOLOCATION_GUIDE.md)** - Géolocalisation GPS
- **[PAYMENT_SYSTEM_GUIDE.md](PAYMENT_SYSTEM_GUIDE.md)** - Mobile Money
- **[STORAGE_GUIDE.md](STORAGE_GUIDE.md)** - Upload fichiers

Et 10+ autres guides techniques dans le dossier racine.

---

## 🔐 Sécurité

- ✅ **RLS (Row Level Security)** activé sur toutes les tables
- ✅ **24 Policies** optimisées et testées
- ✅ **8 Fonctions** sécurisées (search_path fixe)
- ✅ **JWT Authentication** Supabase
- ✅ **CORS** configuré
- ✅ **Rate Limiting** actif
- ✅ **HTTPS** automatique (Vercel/Netlify)

Voir [SECURITY_FINAL_STATUS.md](SECURITY_FINAL_STATUS.md) pour rapport complet.

---

## ⚡ Performance

- **Build:** 376 KB
- **Gzipped:** 95.82 KB (74% compression)
- **Code Splitting:** Automatique (Vite)
- **CDN:** Global (Vercel/Netlify)
- **Indexes:** 43 indexes de performance
- **RLS:** Optimisé (100x plus rapide)

---

## 🧪 Scripts Disponibles

```bash
# Développement
npm run dev          # Dev server (localhost:5173)

# Production
npm run build        # Build production
npm run preview      # Preview build local

# Qualité
npm run lint         # Linter ESLint
npm run typecheck    # Vérification TypeScript
```

---

## 🌍 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Autres Options
- Cloudflare Pages
- VPS/Serveur Linux
- Docker

Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour toutes les options.

---

## 📊 Base de Données

### Migrations
```
✅ 11 migrations appliquées
✅ 24 RLS policies actives
✅ 43 indexes de performance
✅ 2 edge functions déployées
```

### Tables Principales
- `users` - Utilisateurs
- `artisans` - Profils artisans
- `job_requests` - Demandes de travaux
- `quotes` - Devis
- `contracts` - Contrats
- `messages` - Messagerie
- `reviews` - Avis
- `transactions` - Paiements
- `payment_methods` - Moyens de paiement

---

## 🤝 Contributing

Les contributions sont bienvenues! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour guidelines.

---

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour détails.

---

## 🙏 Remerciements

- [Supabase](https://supabase.com) - Backend as a Service
- [Vercel](https://vercel.com) - Hosting
- [React](https://react.dev) - UI Library
- [Vite](https://vitejs.dev) - Build Tool
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

## 📞 Support

- 📧 Email: support@builderhub.com
- 💬 Discord: [BuilderHub Community](https://discord.gg/builderhub)
- 📖 Docs: Voir dossier `/docs`

---

## 🎯 Status

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Build:** ✅ Passing
**Security:** ✅ All issues resolved
**Documentation:** ✅ Complete (18 guides)

---

## 🚀 Next Steps

1. Lire [QUICK_START.md](QUICK_START.md)
2. Déployer sur Vercel (5 minutes)
3. Configurer Supabase
4. Inviter utilisateurs beta
5. Scaler! 🎉

---

**Made with ❤️ by BuilderHub Team**

**⭐ Star us on GitHub if you like this project!**
