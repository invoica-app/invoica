# ⚡ Quick Deploy Reference Card

## 🎯 Your Stack

```
Frontend → Vercel (Next.js)
Backend → Railway (Spring Boot + Kotlin)
Database → Supabase (PostgreSQL)
Storage → AWS S3 (Static files)
```

## 📝 Deployment Order

1. **Supabase** (5 min) - Create database first
2. **AWS S3** (10 min) - Set up file storage
3. **Railway** (5 min) - Deploy backend
4. **Vercel** (5 min) - Deploy frontend

**Total Time:** ~25 minutes

---

## 🔑 Quick Setup Commands

### 1. Supabase
```
1. Sign up: https://supabase.com
2. New Project → Copy connection string
3. Format: postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

### 2. AWS S3
```bash
# Bucket name: invoica-files
# Region: us-east-1
# ✅ Public read access
# ✅ CORS enabled
# ✅ IAM user created
```

### 3. Railway
```bash
# Environment Variables (copy-paste):

DATABASE_URL=postgresql://postgres:...
AWS_S3_BUCKET_NAME=invoica-files
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
SPRING_PROFILES_ACTIVE=prod
CORS_ORIGINS=https://your-app.vercel.app
```

### 4. Vercel
```bash
# Environment Variables:

NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

---

## 📋 Credentials Checklist

Save these somewhere secure:

```
☐ Supabase Connection String
☐ AWS Access Key ID
☐ AWS Secret Access Key
☐ S3 Bucket Name
☐ Railway Backend URL
☐ Vercel Frontend URL
```

---

## 🧪 Testing URLs

```bash
# Backend Health Check
curl https://your-backend.up.railway.app/api/invoices

# Frontend
https://your-app.vercel.app

# Database
https://app.supabase.com → Your Project → Table Editor

# S3 Bucket
https://s3.console.aws.amazon.com/s3/buckets/invoica-files
```

---

## 🆘 Quick Fixes

### Backend not starting?
```
1. Check Railway logs
2. Verify DATABASE_URL format
3. Ensure AWS credentials are correct
```

### CORS errors?
```
1. Update CORS_ORIGINS in Railway
2. Redeploy backend
3. Clear browser cache
```

### File upload failing?
```
1. Check S3 bucket policy
2. Verify IAM permissions
3. Check S3 CORS settings
```

---

## 💸 Free Tier Limits

```
Supabase: 500MB database (plenty for MVP)
Railway: $5 credit/month (enough for backend)
Vercel: Unlimited sites (completely free)
AWS S3: 5GB storage + 20k requests (free tier)

Total: $0-6/month
```

---

## 🚀 One-Command Deploy

After setup, deploy changes with:

```bash
# Just push to GitHub
git add .
git commit -m "Update"
git push

# Railway auto-deploys backend ✅
# Vercel auto-deploys frontend ✅
```

---

## 📱 Access Points

After deployment, save these:

```
Frontend: https://your-app.vercel.app
Backend: https://your-backend.up.railway.app
Database: https://app.supabase.com/project/[id]
Storage: https://s3.console.aws.amazon.com
```

---

## ⚡ Speed Run (Experienced Users)

```
1. Supabase → New Project → Copy URL
2. AWS → S3 Bucket + IAM User → Copy Creds
3. Railway → Import Repo → Paste Env Vars
4. Vercel → Import Repo → Paste API URL
5. Done! ✅
```

Time: ~15 minutes if you've done it before.
