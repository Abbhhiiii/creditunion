# CreditAssist AI - Deployment Guide

## 🚀 Complete Deployment Instructions

This guide covers deploying the entire system using free tier services.

---

## 📋 Prerequisites

- Git account (GitHub, GitLab, etc.)
- Free tier accounts on:
  - **Vercel** (frontend hosting)
  - **Render** or **Railway** (backend hosting)
  - **Supabase** (PostgreSQL database)
  - **Fly.io** (alternative backend)

---

## 🗂️ PART 1: LOCAL SETUP & TESTING

### 1.1 Clone Repository
```bash
git clone <your-repo-url>
cd unioncredits
```

### 1.2 Install Dependencies

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
```

**Frontend:**
```bash
cd ../frontend
npm install
```

**Dashboard:**
```bash
cd ../dashboard
npm install
```

### 1.3 Setup Database Locally

**Option A: Using Docker (Recommended)**
```bash
cd deployment
docker-compose up -d postgres
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb creditassist

# Run migration
cd ../backend
psql creditassist < models/schema.sql
```

### 1.4 Start Services Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - Dashboard:**
```bash
cd dashboard
npm run dev
# Runs on http://localhost:3001
```

### 1.5 Test Locally
- Visit: `http://localhost:3000` - Member Chat
- Visit: `http://localhost:3001` - Staff Dashboard
- API: `http://localhost:5000/api/health` - Should return OK

---

## ☁️ PART 2: CLOUD DEPLOYMENT

### 2.1 Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `creditassist`
   - Region: Pick closest to your users
   - Create password (save it)
   - Wait for project to initialize

2. **Run Schema**
   - In Supabase, go to "SQL Editor"
   - Click "New Query"
   - Copy contents of `backend/models/schema.sql`
   - Run the query
   - Confirm all tables created

3. **Get Connection String**
   - Go to "Settings" → "Database"
   - Copy "URI" (includes password)
   - Format: `postgresql://user:password@host:5432/dbname`

4. **Save for Later**
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### 2.2 Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/creditassist.git
   git push -u origin main
   ```

2. **Create on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub (authorize)
   - Select `creditassist` repository
   - Settings:
     - Name: `creditassist-backend`
     - Environment: `Node`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Plan: **Free**
   - Click "Create Web Service"

3. **Set Environment Variables**
   - In Render dashboard, go to your service
   - Click "Environment" tab
   - Add variables:
     ```
     NODE_ENV=production
     DATABASE_URL=postgresql://user:pass@host/db
     JWT_SECRET=your-super-secret-key-generate-random
     FRONTEND_URL=https://creditassist.vercel.app
     PORT=5000
     ```
   - Click "Save"

4. **Wait for Deployment**
   - Green checkmark = deployed
   - Note the URL (e.g., `https://creditassist-backend.onrender.com`)

### 2.3 Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Enter GitHub URL
   - Select `frontend` as Root Directory
   - Environment Variables:
     ```
     NEXT_PUBLIC_API_URL=https://creditassist-backend.onrender.com
     ```
   - Click "Deploy"

2. **Wait for Completion**
   - Vercel will automatically build and deploy
   - You get a URL like `https://creditassist.vercel.app`

### 2.4 Dashboard Deployment (Vercel or Render)

**Option A: Vercel**
- Same as Frontend, but select `dashboard` folder
- Gets URL like `https://creditassist-dashboard.vercel.app`

**Option B: Render**
- Create another service
- Same process as backend but:
  - Build: `cd dashboard && npm install && npm run build`
  - Start: `cd dashboard && npm start`

---

## 🔐 Security Configuration

### 2.5 Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=generate-with: openssl rand -base64 32
JWT_EXPIRY=24h
FRONTEND_URL=https://yourdomain.com
PORT=5000
LOG_LEVEL=info
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### 2.6 Database Security

- **Supabase Auto**: Has built-in Row Level Security
- **Enable RLS** in Supabase for production
- **Rotate Passwords** regularly
- **Monitor** access logs in Supabase dashboard

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend API responds: `curl https://your-backend/api/health`
- [ ] Frontend loads at HTTPS
- [ ] Dashboard loads at HTTPS
- [ ] Chat sends messages and receives responses
- [ ] Voice input works (tested in browser console)
- [ ] Database queries work (test in backend logs)
- [ ] Staff can see cases in dashboard
- [ ] Analytics show data

---

## 🆘 TROUBLESHOOTING

### Common Issues

**1. Database Connection Error**
```
Error: ECONNREFUSED 127.0.0.1:5432
```
Solution: Check `DATABASE_URL` in environment variables

**2. CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
Solution: Update `FRONTEND_URL` in backend .env

**3. WebSocket Connection Failed**
```
WebSocket error: connection refused
```
Solution: Ensure backend is running and accessible

**4. Vercel Build Fails**
```
npm ERR! code ENOENT
```
Solution: Run `npm install` before building locally

---

## 📈 POST-DEPLOYMENT

### Monitor Health
- Backend: Check Render dashboard
- Frontend: Check Vercel analytics
- Database: Check Supabase monitoring

### Update Code
```bash
git add .
git commit -m "Update feature"
git push origin main
# Auto-deploys to Vercel & Render
```

### Backup Database
- Supabase: Automatic daily backups
- Manual backup: `pg_dump` from psql

---

## 🚀 ADVANCED: Docker Deployment

### Deploy Entire Stack with Docker

```bash
# Using docker-compose (for self-hosted)
docker-compose -f deployment/docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

---

## 💰 Cost Estimate (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | 100 GB bandwidth | $0 |
| Render | 750 hours/month | $0 |
| Supabase | Up to 500 MB DB | $0 |
| **Total** | | **$0** |

*Note: Upgrade only when traffic exceeds free limits*

---

## 📞 Support

For issues, check:
1. [Render Docs](https://render.com/docs)
2. [Vercel Docs](https://vercel.com/docs)
3. [Supabase Docs](https://supabase.com/docs)
4. GitHub Issues in this repository

---

**✅ Deployment Complete! Your CreditAssist AI system is now live.**
