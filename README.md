# 📊 Invoica - Modern Invoice Management System

A full-stack invoice management application with a beautiful UI and robust backend.

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State:** Zustand
- **Icons:** Lucide React

### Backend
- **Framework:** Spring Boot 3.2
- **Language:** Kotlin 1.9
- **Database:** PostgreSQL (Supabase)
- **ORM:** Spring Data JPA
- **Build:** Gradle

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway
- **Database:** Supabase (PostgreSQL)
- **File Storage:** AWS S3

## 📁 Project Structure

```
invoica/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities & API client
│   └── public/       # Static assets
│
├── backend/          # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── kotlin/
│   │       │   └── com/invoicer/
│   │       │       ├── controller/
│   │       │       ├── service/
│   │       │       ├── repository/
│   │       │       ├── model/
│   │       │       └── config/
│   │       └── resources/
│   └── build.gradle.kts
│
└── docs/            # Documentation
    ├── DEPLOYMENT_STACK.md
    ├── QUICK_DEPLOY.md
    └── SYNC_ANALYSIS.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Gradle 8+ (or use IDE)

### Local Development

**1. Start Backend:**
```bash
cd backend

# Option 1: Using IntelliJ IDEA (Recommended)
# Open backend folder → Run InvoicerApplication

# Option 2: Using Gradle
gradle bootRun

# Backend runs on: http://localhost:8080
```

**2. Start Frontend:**
```bash
cd frontend
npm install
npm run dev

# Frontend runs on: http://localhost:3000
```

### Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Backend (application.yml):**
```yaml
# Uses H2 in-memory database by default
# No configuration needed for local development
```

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT_STACK.md)** - Complete deployment instructions
- **[Quick Deploy](QUICK_DEPLOY.md)** - Quick reference card
- **[Sync Analysis](SYNC_ANALYSIS.md)** - Frontend/Backend integration details
- **[Frontend README](frontend/README.md)** - Frontend documentation
- **[Backend README](backend/README.md)** - Backend documentation

## 🎯 Features

- ✅ Create and manage invoices
- ✅ Line item management with auto-calculation
- ✅ Company branding customization
- ✅ Email configuration
- ✅ Logo upload (AWS S3)
- ✅ PostgreSQL database
- ✅ RESTful API
- ✅ Responsive design

## 🚀 Deployment

See [DEPLOYMENT_STACK.md](DEPLOYMENT_STACK.md) for complete deployment instructions.

**Quick Deploy:**
1. Create Supabase database
2. Set up AWS S3 bucket
3. Deploy backend to Railway
4. Deploy frontend to Vercel

**Estimated time:** 25 minutes

## 🧪 API Endpoints

```
POST   /api/invoices           Create invoice
GET    /api/invoices           List all invoices
GET    /api/invoices/{id}      Get invoice by ID
PUT    /api/invoices/{id}      Update invoice
DELETE /api/invoices/{id}      Delete invoice
POST   /api/upload/logo        Upload company logo
```

## 💰 Hosting Costs

| Service | Cost |
|---------|------|
| Vercel (Frontend) | Free |
| Railway (Backend) | $0-5/mo |
| Supabase (Database) | Free |
| AWS S3 (Storage) | $0-1/mo |
| **Total** | **$0-6/mo** |

## 📞 Support

- Frontend: [Next.js Docs](https://nextjs.org/docs)
- Backend: [Spring Boot Docs](https://spring.io/projects/spring-boot)
- Database: [Supabase Docs](https://supabase.com/docs)

## 📄 License

MIT

---

**Built with ❤️ using Next.js, Spring Boot, and Kotlin**
