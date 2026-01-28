# 🚀 Quick Deployment Steps for Vercel

## ✅ What's Been Done

Your app has been fully migrated from SQLite to Vercel Postgres:
- ✅ All database queries converted to PostgreSQL
- ✅ Async/await implementation complete
- ✅ Dependencies updated (removed `better-sqlite3`)
- ✅ Code validated with no errors

---

## 📦 Step-by-Step Deployment

### 1️⃣ Install New Dependencies

```bash
cd server
npm install
```

This will install `@vercel/postgres` and remove the old SQLite dependency.

### 2️⃣ Create Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click on your project (or create new project)
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name it: `bioaffinity-db`
6. Select region (closest to you)
7. Click **Create**

### 3️⃣ Copy Environment Variables

After creating the database, Vercel shows you environment variables. They're automatically added to your project, but you can view them in:

**Settings → Environment Variables**

Required variables:
- `POSTGRES_URL` (auto-added)
- `JWT_SECRET` (you need to add this manually)
- `DB_SECRET_KEY` (you need to add this manually)

To add custom variables:
1. Go to **Settings → Environment Variables**
2. Add `JWT_SECRET` = your secret key
3. Add `DB_SECRET_KEY` = `super-secret-db-key-2026`
4. Save

### 4️⃣ Deploy Backend

```bash
cd server
vercel --prod
```

Or link to GitHub for automatic deployments:
```bash
git add .
git commit -m "Migrated to Vercel Postgres"
git push origin main
```

### 5️⃣ Deploy Frontend

```bash
cd ../frontend
npm run build
vercel --prod
```

### 6️⃣ Test Your Deployment

Visit your deployed URL and test:
- Health check: `https://your-app.vercel.app/api/health`
- Register a user
- Login
- Create a prediction

---

## 🔧 Local Development Setup (Optional)

If you want to develop locally using the cloud database:

1. Create `server/.env`:
```bash
cp server/.env.example server/.env
```

2. Copy Postgres connection strings from Vercel Dashboard → Storage → Postgres → `.env.local` tab

3. Paste them into your `.env` file

4. Run locally:
```bash
cd server
npm run dev
```

⚠️ **Warning**: Local and production will use the SAME database!

---

## 📋 Checklist Before Going Live

- [ ] Vercel Postgres database created
- [ ] Environment variables set in Vercel Dashboard
- [ ] Dependencies installed (`npm install`)
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Health endpoint responding
- [ ] User registration works
- [ ] Login works
- [ ] Predictions work
- [ ] Data persists after redeployment

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module '@vercel/postgres'"
**Fix**: Run `npm install` in the server directory

### Issue: "Connection to database failed"
**Fix**: Check environment variables are set in Vercel Dashboard

### Issue: "Table 'users' does not exist"
**Fix**: 
1. Go to Vercel Dashboard → Storage → Postgres → Data
2. Run this SQL:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Issue: Build fails with "better-sqlite3" errors
**Fix**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoring

After deployment, monitor your app:
- **Logs**: `vercel logs --follow`
- **Database**: Vercel Dashboard → Storage → Postgres → Logs
- **Errors**: Vercel Dashboard → Project → Deployments → (click deployment) → Logs

---

## 🎉 You're Ready!

Your app is now production-ready with:
- ✅ Persistent database (no more data loss)
- ✅ Scalable architecture
- ✅ Automatic backups
- ✅ Global edge network
- ✅ HTTPS by default

**Next**: Deploy and test! 🚀

---

For detailed technical information, see: `VERCEL_POSTGRES_MIGRATION.md`
