# 🚀 Deployment Guide: AWS S3 + Railway + Vercel + Supabase

Complete step-by-step guide for deploying the Invoica application.

## 🏗️ Architecture

```
┌─────────────┐
│   Vercel    │  Frontend (Next.js)
│  (Frontend) │  https://your-app.vercel.app
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   Railway   │────▶│   Supabase   │
│  (Backend)  │     │  (Database)  │
│  Spring Boot│     │  PostgreSQL  │
└──────┬──────┘     └──────────────┘
       │
       ▼
┌─────────────┐
│   AWS S3    │  Static files (logos)
│  (Storage)  │  s3://invoica-files
└─────────────┘
```

## 📋 Prerequisites

- GitHub account
- AWS account
- Vercel account (free)
- Railway account (free)
- Supabase account (free)

---

## 1️⃣ Supabase Setup (Database)

### Create Database

1. **Sign up:** https://supabase.com
2. **Create project:**
   - Click "New Project"
   - Name: `invoica-db`
   - Password: (generate strong password)
   - Region: Choose closest to you
   - Wait 2-3 minutes for provisioning

3. **Get Connection String:**
   ```
   Go to: Project Settings → Database → Connection String

   Copy the "URI" format (not the "Transaction" one):
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

4. **Save this for later!** You'll need it for Railway.

### Database Schema

Supabase will auto-create tables when Spring Boot starts (JPA creates them).

---

## 2️⃣ AWS S3 Setup (File Storage)

### Create S3 Bucket

1. **Login to AWS Console:** https://console.aws.amazon.com
2. **Go to S3:** Search for "S3" in services
3. **Create Bucket:**
   ```
   Bucket name: invoica-files (must be globally unique)
   Region: us-east-1 (or your preferred region)

   ✅ Uncheck "Block all public access"
   ⚠️ Acknowledge the warning (we need public read for images)

   Click "Create bucket"
   ```

4. **Configure Public Access:**
   - Go to bucket → Permissions → Bucket Policy
   - Add this policy (replace `YOUR-BUCKET-NAME`):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```

5. **Configure CORS:**
   - Go to Permissions → CORS configuration
   - Add this:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://your-app.vercel.app"
       ],
       "ExposeHeaders": []
     }
   ]
   ```

### Create IAM User

1. **Go to IAM:** Search for "IAM" in AWS Console
2. **Create User:**
   ```
   Users → Add users

   Username: invoica-app
   ✅ Access key - Programmatic access

   Click "Next"
   ```

3. **Set Permissions:**
   ```
   Attach policies directly:
   ✅ AmazonS3FullAccess

   Click "Next" → "Create user"
   ```

4. **Save Credentials:**
   ```
   Access key ID: AKIA...
   Secret access key: wJalr...

   ⚠️ SAVE THESE NOW - You won't see the secret again!
   ```

---

## 3️⃣ Railway Setup (Backend)

### Deploy Backend

1. **Sign up:** https://railway.app (use GitHub)

2. **Create New Project:**
   ```
   Dashboard → New Project → Deploy from GitHub repo

   Select: your repository
   Root directory: backend
   ```

3. **Configure Build:**
   Railway auto-detects Spring Boot, but verify:
   ```
   Build Command: ./gradlew build -x test
   Start Command: java -jar build/libs/*.jar
   ```

4. **Add Environment Variables:**

   Click on your service → Variables → Add all these:

   ```bash
   # Database (Supabase)
   DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

   # AWS S3
   AWS_S3_BUCKET_NAME=invoica-files
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=wJalr...

   # Spring Profile
   SPRING_PROFILES_ACTIVE=prod

   # CORS (update after Vercel deployment)
   CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```

5. **Deploy:**
   ```
   Railway deploys automatically on push

   Get your backend URL:
   Settings → Generate Domain → Copy URL
   Example: https://invoica-backend.up.railway.app
   ```

6. **Verify:**
   ```bash
   # Test backend is running
   curl https://your-backend.up.railway.app/api/invoices

   # Should return: []
   ```

---

## 4️⃣ Vercel Setup (Frontend)

### Deploy Frontend

1. **Sign up:** https://vercel.com (use GitHub)

2. **Import Project:**
   ```
   Add New → Project → Import Git Repository

   Select: your repository
   ```

3. **Configure Build:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
   ```

5. **Deploy:**
   ```
   Click "Deploy"

   Wait ~2 minutes for build

   Get your frontend URL:
   Example: https://invoica-app.vercel.app
   ```

6. **Update Backend CORS:**
   - Go back to Railway
   - Update `CORS_ORIGINS` environment variable:
     ```
     CORS_ORIGINS=https://invoica-app.vercel.app,http://localhost:3000
     ```
   - Railway will auto-redeploy

---

## 5️⃣ Final Configuration

### Update S3 CORS (if needed)

Go back to AWS S3 → Your bucket → Permissions → CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://invoica-app.vercel.app"
    ],
    "ExposeHeaders": []
  }
]
```

### Test the Full Stack

1. **Open Frontend:** https://your-app.vercel.app
2. **Create Invoice:** Fill out all steps
3. **Upload Logo:** Test file upload to S3
4. **Submit:** Save invoice to database
5. **Verify:** Check Supabase dashboard for data

---

## 📊 Environment Variables Summary

### Backend (Railway)

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# AWS S3
AWS_S3_BUCKET_NAME=invoica-files
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...

# Spring
SPRING_PROFILES_ACTIVE=prod

# CORS
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

---

## 🔍 Troubleshooting

### Backend won't start on Railway

```bash
# Check logs in Railway dashboard
# Common issues:
- DATABASE_URL format wrong (check Supabase connection string)
- AWS credentials invalid
- Build failed (check Gradle wrapper exists)
```

### Frontend can't reach backend

```bash
# Check:
1. Backend is running (visit backend URL)
2. CORS is configured correctly
3. NEXT_PUBLIC_API_URL is correct
4. Railway domain is public
```

### File upload fails

```bash
# Check:
1. S3 bucket policy allows uploads
2. IAM user has S3 permissions
3. AWS credentials in Railway are correct
4. S3 CORS allows your frontend domain
```

### Database connection fails

```bash
# Check:
1. Supabase project is running
2. DATABASE_URL is correct format
3. Password is correct (no special chars that need escaping)
4. Port 5432 is accessible
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| **Supabase** | 500MB DB, 2GB bandwidth | Light | $0 |
| **Railway** | $5 credit/month | Backend hosting | $0-5 |
| **Vercel** | Unlimited sites | Frontend hosting | $0 |
| **AWS S3** | 5GB storage, 20k GET | File storage | $0-1 |
| **Total** | | | **$0-6/month** |

---

## 🚀 Deployment Checklist

- [ ] Supabase database created
- [ ] Connection string saved
- [ ] AWS S3 bucket created
- [ ] S3 bucket policy configured
- [ ] S3 CORS configured
- [ ] IAM user created
- [ ] AWS credentials saved
- [ ] Railway backend deployed
- [ ] Railway environment variables set
- [ ] Backend URL obtained
- [ ] Vercel frontend deployed
- [ ] Vercel environment variable set
- [ ] CORS updated with Vercel URL
- [ ] Full stack tested
- [ ] Logo upload tested

---

## 🎉 You're Live!

Your application is now deployed on production infrastructure:

```
✅ Frontend: https://your-app.vercel.app
✅ Backend: https://your-backend.up.railway.app
✅ Database: Supabase PostgreSQL
✅ Storage: AWS S3
```

**Next Steps:**
1. Set up custom domain (optional)
2. Add authentication
3. Monitor logs
4. Set up backups
5. Add SSL certificate (Vercel/Railway provide free)

---

## 📞 Support Links

- **Railway:** https://railway.app/help
- **Vercel:** https://vercel.com/support
- **Supabase:** https://supabase.com/docs
- **AWS S3:** https://docs.aws.amazon.com/s3
