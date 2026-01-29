# 🔐 Authentication Implementation Complete

Social logins (Google, Microsoft) + Guest mode successfully implemented.

## ✅ What Was Implemented

### Backend (Spring Boot + JWT)

**New Files:**
```
backend/src/main/kotlin/com/invoicer/
├── entity/User.kt                      # User entity with OAuth support
├── repository/UserRepository.kt        # User data access
├── security/
│   ├── JwtUtil.kt                     # JWT token generation/validation
│   ├── SecurityConfig.kt              # Spring Security configuration
│   └── JwtAuthenticationFilter.kt     # JWT request filter
├── service/AuthService.kt             # Auth business logic
├── controller/AuthController.kt       # Auth endpoints
└── dto/AuthDto.kt                     # Auth request/response DTOs
```

**Dependencies Added:**
- Spring Security
- Spring OAuth2 Client
- JWT (io.jsonwebtoken:jjwt)

**API Endpoints:**
```
POST /api/auth/oauth/login     # OAuth login (Google/Microsoft)
POST /api/auth/guest/login     # Guest login
GET  /api/auth/me              # Get current user (protected)
```

**Protected Routes:**
All `/api/invoices/*` endpoints now require authentication (JWT token in Authorization header).

### Frontend (Next.js + NextAuth.js)

**New Files:**
```
frontend/
├── app/api/auth/[...nextauth]/route.ts  # NextAuth API routes
├── types/next-auth.d.ts                 # TypeScript type extensions
├── components/providers/session-provider.tsx  # Session provider wrapper
├── lib/auth.ts                          # Auth hooks and helpers
└── middleware.ts                        # Route protection middleware
```

**Updated Files:**
- `app/login/page.tsx` - Real OAuth + Guest authentication
- `app/layout.tsx` - Added SessionProvider
- `lib/api.ts` - Added JWT token support
- `package.json` - Added next-auth dependency
- `.env.example` - Added OAuth environment variables

**Protected Routes:**
- `/dashboard/*`
- `/invoice/*`
- `/settings/*`

## 🎯 How It Works

### Authentication Flow

**1. Google/Microsoft OAuth:**
```
User clicks "Sign in with Google/Microsoft"
  ↓
NextAuth redirects to OAuth provider
  ↓
User authenticates with provider
  ↓
NextAuth receives user info
  ↓
Frontend calls backend /api/auth/oauth/login
  ↓
Backend creates/updates user in database
  ↓
Backend generates JWT token
  ↓
NextAuth stores token in session
  ↓
User redirected to /dashboard
```

**2. Guest Mode:**
```
User clicks "Continue as Guest"
  ↓
Frontend calls backend /api/auth/guest/login
  ↓
Backend creates guest user (unique email)
  ↓
Backend generates JWT token with isGuest=true
  ↓
NextAuth stores token in session
  ↓
User redirected to /dashboard
```

### Making Authenticated API Calls

**Option 1: Using the auth hook**
```typescript
"use client";

import { useAuth } from "@/lib/auth";
import { invoiceApi } from "@/lib/api";

export default function MyComponent() {
  const { accessToken } = useAuth();

  const createInvoice = async () => {
    const invoice = await invoiceApi.create(data, accessToken);
  };
}
```

**Option 2: Server-side with getServerSession**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  const invoices = await invoiceApi.getAll(undefined, token);
}
```

## 🔧 Setup Instructions

### 1. Backend Setup

**No additional setup needed for local development!**

The backend is configured to use:
- H2 in-memory database (auto-creates tables)
- Default JWT secret (configured in `application.yml`)

**For production:**
Update `application-prod.yml` with:
- Production JWT secret
- PostgreSQL database URL
- CORS origins (your Vercel URL)

### 2. Frontend Setup

**Install dependencies:**
```bash
cd frontend
npm install
```

**For Guest Mode Only (works immediately):**
No OAuth setup needed! Guest mode works out of the box.

**For Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-app.vercel.app/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret
6. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

**For Microsoft OAuth:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration:
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
4. Copy Application (client) ID and Directory (tenant) ID
5. Create a client secret in Certificates & secrets
6. Add to `.env.local`:
   ```
   MICROSOFT_CLIENT_ID=your-microsoft-client-id
   MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
   MICROSOFT_TENANT_ID=common
   ```

### 3. Environment Variables

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Optional: Only needed if you want OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common
```

**Backend (already configured in `application.yml`):**
```yaml
jwt:
  secret: your-256-bit-secret-key-change-this-in-production
  expiration: 86400000  # 24 hours
```

## 🚀 Testing Authentication

### 1. Start Backend
```bash
cd backend
./gradlew bootRun

# Backend runs on http://localhost:8080
```

### 2. Start Frontend
```bash
cd frontend
npm run dev

# Frontend runs on http://localhost:3000
```

### 3. Test Flows

**Test Guest Login:**
1. Go to `http://localhost:3000/login`
2. Click "Continue as Guest"
3. Should redirect to `/dashboard`
4. Check browser console - should see session with `isGuest: true`

**Test OAuth (if configured):**
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google" or "Sign in with Microsoft"
3. Complete OAuth flow
4. Should redirect to `/dashboard`
5. Check browser console - should see session with user email

### 4. Test Protected Routes
1. Open new incognito window
2. Go to `http://localhost:3000/dashboard`
3. Should redirect to `/login`
4. Login with guest or OAuth
5. Should see dashboard

### 5. Test API Calls
```bash
# Get guest login token
curl -X POST http://localhost:8080/api/auth/guest/login

# Use token to access protected endpoint
curl http://localhost:8080/api/invoices \
  -H "Authorization: Bearer <your-token>"
```

## 📊 Database Schema

**User Table:**
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,  -- GOOGLE, MICROSOFT, GUEST
  provider_id VARCHAR(255),
  is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

## 🔐 Security Features

✅ **JWT Token Authentication** - Stateless, secure tokens
✅ **Token Expiration** - Tokens expire after 24 hours
✅ **Protected Routes** - Middleware guards all protected pages
✅ **CORS Configuration** - Only allows requests from frontend
✅ **Guest Isolation** - Guest users get unique, isolated accounts
✅ **OAuth Integration** - Secure third-party authentication
✅ **HTTPS in Production** - Vercel/Railway provide SSL automatically

## 🎨 User Experience

**Login Page:**
- Clean, modern UI matching Figma design
- Loading states on all buttons
- Disabled state while authenticating
- Clear error handling

**Authentication States:**
- ✅ Unauthenticated - Shows login page
- ✅ Loading - Shows loading spinner
- ✅ Authenticated - Access to app
- ✅ Guest - Full access with guest badge (if needed)

## 📝 Next Steps

**Optional Enhancements:**
- [ ] Add user profile page
- [ ] Add sign out functionality
- [ ] Add session expiration handling
- [ ] Add "Remember me" option
- [ ] Add email verification (for non-OAuth users)
- [ ] Add password reset flow (if adding email/password)
- [ ] Add user settings management
- [ ] Add invoice ownership (link invoices to users)
- [ ] Add multi-tenancy (teams/organizations)

**Production Checklist:**
- [ ] Set strong JWT secret in production
- [ ] Configure OAuth redirect URLs for production domain
- [ ] Update CORS origins for production frontend
- [ ] Enable HTTPS only
- [ ] Set up session monitoring
- [ ] Add rate limiting
- [ ] Add audit logging

## 🐛 Troubleshooting

**"Cannot find module 'next-auth'"**
```bash
cd frontend && npm install
```

**OAuth not working locally:**
- Check OAuth credentials are in `.env.local`
- Verify redirect URIs in Google/Microsoft console
- Restart dev server after adding env vars

**JWT validation fails:**
- Check JWT secret matches between backend and token
- Verify token hasn't expired
- Check Authorization header format: `Bearer <token>`

**Protected routes not working:**
- Check `middleware.ts` is at root of `frontend/` directory
- Verify NextAuth is configured correctly
- Check session in browser DevTools → Application → Storage

## ✅ Summary

**Backend:**
- ✅ Spring Security configured
- ✅ JWT authentication implemented
- ✅ User entity created
- ✅ Auth endpoints exposed
- ✅ Protected invoice endpoints

**Frontend:**
- ✅ NextAuth.js configured
- ✅ OAuth providers set up (Google, Microsoft)
- ✅ Guest mode implemented
- ✅ Login page updated with real auth
- ✅ Route protection added
- ✅ Auth hooks created
- ✅ API client supports JWT tokens

**Everything is ready to use!** 🎉

Guest mode works immediately. OAuth requires credentials but setup is documented above.
