# 🚀 START HERE - BuilderHub Setup

## 👋 Welcome!

Your BuilderHub platform is **ready** but needs **3 simple steps** to activate all features.

**Time needed**: 4-6 minutes ⏱️

---

## ⚡ Quick Path (Recommended)

### 1️⃣ Fix Database (2 min)

**Go to**: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/editor

1. Click "SQL Editor"
2. Copy ALL SQL from `supabase/migrations/20251206000000_comprehensive_auth_fix.sql`
3. Paste and click "Run"
4. See "✅ SUCCESS"

### 2️⃣ Get Service Key (1 min)

**Go to**: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/settings/api

1. Scroll to "Project API keys"
2. Find "service_role" → Click "Reveal"
3. Copy the key
4. Add to `.env`:
```
SUPABASE_SERVICE_ROLE_KEY=paste_key_here
```

### 3️⃣ Create Admin (1 min)

```bash
npm run create-admin
```

Enter email and password when prompted.

---

## ✅ Test It Works

```bash
npm run dev
```

Open http://localhost:5173 and test:
- ✅ Admin login (use email/password from step 3)
- ✅ Client registration (click "Inscription" → "Client")
- ✅ Artisan registration (click "Inscription" → "Artisan")

---

## 📚 Need More Help?

**Quick Guide** (6 min): `QUICK_START_INSTRUCTIONS.md`  
**Full Guide** (detailed): `SETUP_GUIDE.md`  
**What's Fixed**: `FIXES_APPLIED.md`

---

## 🎯 What's Already Working

✅ **Build**: Compiles successfully  
✅ **UI**: All dashboards ready  
✅ **Features**: All implemented  
✅ **Auth System**: All code ready  

⏳ **Just Needs**: Database setup (steps above)

---

## 🐛 Troubleshooting

**"Database error"** → Do step 1  
**Admin script fails** → Check step 2  
**Can't register** → Complete step 1  

See `SETUP_GUIDE.md` for detailed troubleshooting.

---

## 🎉 After Setup

Your platform will support:
- 👑 **Admins** - Full platform control
- 📝 **Clients** - Post jobs, hire artisans
- 🔨 **Artisans** - Find jobs, submit quotes

Plus: Payments, Messaging, Reviews, Geolocation, and more!

---

**Ready?** Start with step 1 above! ⬆️
