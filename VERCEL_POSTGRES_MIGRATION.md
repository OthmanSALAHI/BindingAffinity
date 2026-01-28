# 🚀 Migration Guide: SQLite → Vercel Postgres

## ⚠️ Why This Migration is Critical

**SQLite with `better-sqlite3` DOES NOT WORK on Vercel** because:

1. **Ephemeral File System**: Vercel uses serverless functions. Your `database.sqlite` file is deleted after each deployment or when the function goes to sleep.
2. **Data Loss**: All user accounts, data, and uploads are wiped clean regularly.
3. **No Persistence**: The file system is read-only or temporary in production.

**Solution**: Use **Vercel Postgres** - a cloud-hosted PostgreSQL database that persists data permanently.

---

## ✅ Migration Completed

I've already converted your entire backend from SQLite to Vercel Postgres. Here's what was changed:

### Files Modified:
1. ✅ `server/config/database.js` - Now uses `@vercel/postgres`
2. ✅ `server/routes/auth.js` - All queries converted to async/await Postgres
3. ✅ `server/routes/database.js` - Admin routes updated for Postgres
4. ✅ `server/index.js` - Async database initialization
5. ✅ `server/package.json` - Removed `better-sqlite3`, added `@vercel/postgres`

### Database Schema Changes:
- `INTEGER` → `SERIAL` (for auto-incrementing IDs)
- `TEXT` → `VARCHAR(255)` (for limited strings)
- `INTEGER DEFAULT 0` → `BOOLEAN DEFAULT FALSE` (for `is_admin`)
- `DATETIME` → `TIMESTAMP`

---

## 📋 Next Steps: Setup Vercel Postgres

### Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one if you haven't deployed yet)
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., `bioaffinity-db`)
7. Select a region (choose closest to your users)
8. Click **Create**

### Step 2: Get Database Connection String

After creating the database, Vercel will show you environment variables. Copy them all.

### Step 3: Set Environment Variables in Vercel

Vercel automatically adds these to your project, but verify:

```bash
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NO_SSL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

Also add your custom variables:
- `JWT_SECRET` - Your JWT secret key
- `DB_SECRET_KEY` - Your database admin secret key
- `NODE_ENV=production`

### Step 4: Install Dependencies Locally

```bash
cd server
npm install
```

This will install `@vercel/postgres` and remove `better-sqlite3`.

### Step 5: Setup Local Development (Optional)

If you want to test locally with the cloud database:

1. Create a `.env` file in the `server` folder
2. Copy `.env.example` to `.env`
3. Paste your Vercel Postgres connection strings
4. Run: `npm run dev`

**Important**: The database is in the cloud, so local and production use the **same database**. Consider creating a separate database for development.

### Step 6: Deploy to Vercel

```bash
# From your project root
vercel deploy --prod
```

Or push to your GitHub repository if you have automatic deployments enabled.

---

## 🔧 Environment Variables Template

See `server/.env.example` for the complete template. Here's what you need:

```bash
# Required for JWT authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Required for admin database access
DB_SECRET_KEY=super-secret-db-key-2026

# Auto-populated by Vercel (copy from Vercel Dashboard)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
# ... etc
```

---

## 🧪 Testing the Migration

After deployment:

1. **Test Health Endpoint**: `GET /api/health`
2. **Register a User**: `POST /api/auth/register`
3. **Login**: `POST /api/auth/login`
4. **Verify Persistence**: Stop the serverless function (wait 5 mins), then login again - user should still exist

---

## 📝 Key Code Changes

### Before (SQLite):
```javascript
const db = require('better-sqlite3')('database.sqlite');
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
```

### After (Postgres):
```javascript
const { sql } = require('@vercel/postgres');
const result = await sql`SELECT * FROM users WHERE email = ${email}`;
const user = result.rows[0];
```

---

## 🐛 Troubleshooting

### "Connection to database failed"
- **Check**: Environment variables are set in Vercel Dashboard
- **Check**: Database is not paused (free tier databases may pause)
- **Solution**: Go to Vercel Storage, wake up database

### "Table 'users' does not exist"
- **Cause**: Database initialization didn't run
- **Solution**: The first deployment will create the table automatically
- **Manual**: Run this SQL in Vercel Postgres dashboard:
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

### "Better-sqlite3 build errors"
- **Cause**: Old dependency still in package-lock.json
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`

---

## 📊 Database Management

### View Data in Vercel Dashboard
1. Go to Vercel Dashboard → Storage → Postgres
2. Click **Data** tab
3. Write SQL queries to view/edit data

### Using pgAdmin or TablePlus
Use the `POSTGRES_URL_NON_POOLING` connection string to connect external tools.

---

## ⚡ Performance Notes

- **Connection Pooling**: Automatically handled by Vercel Postgres
- **Query Limits**: Free tier has limits (check Vercel pricing)
- **Concurrent Connections**: Limited on free tier (60 connections)

---

## 🔐 Security Considerations

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Rotate JWT_SECRET** regularly in production
3. **Use strong passwords** for admin accounts
4. **Monitor database access** from Vercel dashboard

---

## 🎉 Benefits of This Migration

✅ **Persistent Data**: Your users won't disappear  
✅ **Scalable**: Handles thousands of concurrent users  
✅ **Automatic Backups**: Vercel handles this  
✅ **Global Performance**: Edge-optimized connections  
✅ **Production Ready**: No more "it works locally but not in production"

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs: `vercel logs`
2. Check Vercel Postgres dashboard for errors
3. Verify all environment variables are set
4. Test endpoints with Postman/Thunder Client

---

**Migration Status**: ✅ COMPLETE  
**Next Action**: Create Vercel Postgres database and deploy!
