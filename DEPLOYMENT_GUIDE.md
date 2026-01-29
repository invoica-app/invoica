# Invoicer Deployment Guide 🚀

Complete guide for deploying the Invoicer application to production.

## 📋 Pre-Deployment Checklist

### Frontend ✅
- [x] Environment variables configured
- [x] API service layer created
- [x] TypeScript types defined
- [x] Build tested locally
- [ ] Update API URL for production

### Backend ✅
- [x] Database configuration ready
- [x] CORS configured
- [x] Error handling implemented
- [ ] Switch H2 → PostgreSQL
- [ ] Add authentication (optional)

## 🎯 Recommended: Vercel + Railway (Easiest & Free)

### Step 1: Deploy Backend to Railway

**Why Railway?**
- Free PostgreSQL database included
- Zero config deployment
- Auto-deploys from Git

**Instructions:**

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   ```
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the backend folder
   ```

3. **Add PostgreSQL**
   ```
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will provision a database
   ```

4. **Configure Backend**

   Railway auto-detects Spring Boot. Add these environment variables:

   ```bash
   # Database (Railway provides these automatically)
   SPRING_DATASOURCE_URL=jdbc:postgresql://...
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=...

   # JPA Settings
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   SPRING_JPA_SHOW_SQL=false

   # Server
   SERVER_PORT=8080
   ```

5. **Update CORS**

   In `backend/src/main/kotlin/com/invoicer/config/WebConfig.kt`:
   ```kotlin
   .allowedOrigins(
       "http://localhost:3000",
       "https://your-app.vercel.app"  // Add your Vercel URL
   )
   ```

6. **Deploy**
   - Railway auto-deploys on push
   - Get your backend URL: `https://your-app.up.railway.app`

### Step 2: Deploy Frontend to Vercel

**Why Vercel?**
- Made by Next.js creators
- Zero-config Next.js deployment
- Free SSL + CDN
- Automatic previews

**Instructions:**

1. **Sign up for Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   ```
   - Click "Add New" → "Project"
   - Import your repository
   - Select frontend folder as root directory
   ```

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get your URL: `https://your-app.vercel.app`

### Step 3: Final Configuration

1. **Update Backend CORS** (if not done)
   ```kotlin
   .allowedOrigins("https://your-app.vercel.app")
   ```

2. **Redeploy Backend** on Railway (auto-deploys on push)

3. **Test Production**
   - Visit your Vercel URL
   - Create a test invoice
   - Verify it saves to database

**Total Cost:** $0/month (Free tier)

---

## 🏗️ Alternative: AWS (Production-Grade)

### Architecture
```
Frontend → S3 + CloudFront
Backend → Elastic Beanstalk
Database → RDS PostgreSQL
```

### Step 1: RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier invoicer-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YourPassword123 \
  --allocated-storage 20
```

### Step 2: Elastic Beanstalk (Backend)

```bash
# Initialize EB
cd backend
eb init -p corretto-17 invoicer-api

# Create environment
eb create invoicer-prod

# Set environment variables
eb setenv SPRING_DATASOURCE_URL=jdbc:postgresql://...
eb setenv SPRING_DATASOURCE_USERNAME=postgres
eb setenv SPRING_DATASOURCE_PASSWORD=YourPassword123

# Deploy
./gradlew clean build
eb deploy
```

### Step 3: S3 + CloudFront (Frontend)

```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync out/ s3://invoicer-frontend

# Create CloudFront distribution
# (Use AWS Console or CLI)
```

**Cost:** ~$30-50/month

---

## 🌐 Alternative: Google Cloud

### Architecture
```
Frontend → Firebase Hosting
Backend → Cloud Run
Database → Cloud SQL
```

### Step 1: Cloud SQL (PostgreSQL)

```bash
# Create instance
gcloud sql instances create invoicer-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create invoicer \
  --instance=invoicer-db
```

### Step 2: Cloud Run (Backend)

```bash
# Build container
cd backend
./gradlew bootBuildImage --imageName=gcr.io/YOUR_PROJECT/invoicer-api

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT/invoicer-api

# Deploy to Cloud Run
gcloud run deploy invoicer-api \
  --image gcr.io/YOUR_PROJECT/invoicer-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SPRING_DATASOURCE_URL=...
```

### Step 3: Firebase Hosting (Frontend)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
cd frontend
firebase init hosting

# Deploy
npm run build
firebase deploy
```

**Cost:** ~$20-35/month

---

## 🐳 Alternative: Docker Compose (VPS)

For DigitalOcean, Linode, or any VPS.

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: invoicer
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/invoicer
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

### Deploy to VPS

```bash
# SSH to server
ssh user@your-server

# Clone repository
git clone https://github.com/yourusername/invoicer.git
cd invoicer

# Set environment variables
echo "DB_PASSWORD=YourSecurePassword" > .env

# Start services
docker-compose up -d

# Set up SSL (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com
```

**Cost:** $5-12/month (VPS)

---

## 📊 Platform Comparison

| Platform | Setup | Scaling | Cost/mo | Best For |
|----------|-------|---------|---------|----------|
| **Vercel + Railway** | ⭐⭐⭐⭐⭐ Easy | Auto | $0-10 | MVPs, Startups |
| **AWS** | ⭐⭐⭐ Medium | Manual | $30-50 | Enterprise |
| **Google Cloud** | ⭐⭐⭐ Medium | Auto | $20-35 | Scalability |
| **Docker + VPS** | ⭐⭐ Hard | Manual | $5-12 | Full Control |

## 🔐 Security Checklist

### Frontend
- [ ] Environment variables (never commit `.env.local`)
- [ ] API URL uses HTTPS in production
- [ ] No sensitive data in client code
- [ ] CSP headers configured

### Backend
- [ ] Database uses SSL
- [ ] CORS restricted to frontend domain
- [ ] API rate limiting (Spring Security)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (JPA)
- [ ] Secrets in environment variables

### Database
- [ ] Strong password
- [ ] Restricted network access
- [ ] Regular backups
- [ ] Encryption at rest

## 🎯 Post-Deployment Tasks

### Monitoring
1. Set up error tracking (Sentry)
2. Add analytics (Google Analytics)
3. Monitor API performance (New Relic)
4. Set up uptime monitoring (UptimeRobot)

### Optimization
1. Enable CDN for assets
2. Add database indexes
3. Implement caching (Redis)
4. Optimize images

### Maintenance
1. Set up CI/CD (GitHub Actions)
2. Automated backups
3. Security updates
4. Performance monitoring

## 🚀 Quick Start (Railway + Vercel)

**5 Minutes to Production:**

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/invoicer.git
git push -u origin main

# 2. Deploy backend to Railway
# - Connect GitHub repo
# - Add PostgreSQL
# - Auto-deploys ✅

# 3. Deploy frontend to Vercel
# - Import GitHub repo
# - Add API URL env var
# - Auto-deploys ✅

# 4. Done! 🎉
```

## 📞 Support

If you need help:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- AWS: https://aws.amazon.com/support
- GCP: https://cloud.google.com/support

---

**Recommendation:** Start with Vercel + Railway (free), then scale to AWS/GCP when needed.
