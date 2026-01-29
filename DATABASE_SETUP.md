# 🗄️ Database Setup Guide

## Local Development (PostgreSQL)

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**macOS (Postgres.app):**
Download from https://postgresapp.com/

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Development Database

```bash
# Connect to PostgreSQL
psql postgres

# In psql console:
CREATE DATABASE invoica_dev;

# Create user (optional, or use default postgres user)
CREATE USER invoica_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE invoica_dev TO invoica_user;

# Exit psql
\q
```

### 3. Configure Backend

**Option 1: Using .env file (Recommended)**

The backend already has a `.env` file with default settings:

```bash
# backend/.env
DB_URL=jdbc:postgresql://localhost:5432/invoica_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres

JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=86400000

CORS_ORIGINS=http://localhost:3000
```

**Update the password if you changed it:**
```bash
# Edit backend/.env
DB_PASSWORD=your_password
```

**Option 2: Using Environment Variables**

```bash
# Export environment variables (macOS/Linux)
export DB_URL=jdbc:postgresql://localhost:5432/invoica_dev
export DB_USERNAME=postgres
export DB_PASSWORD=postgres

# Windows PowerShell
$env:DB_URL="jdbc:postgresql://localhost:5432/invoica_dev"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
```

### 4. Verify Connection

```bash
# Test connection
psql -h localhost -U postgres -d invoica_dev

# Should connect successfully
# Type \q to exit
```

### 5. Run Backend

```bash
cd backend
./gradlew bootRun

# Or with Gradle installed
gradle bootRun

# Or in IntelliJ IDEA
# Open backend folder → Run InvoicerApplication
```

**Expected Output:**
```
Hibernate: create table users (...)
Hibernate: create table invoices (...)
Started InvoicerApplication in X.XXX seconds
```

### 6. Verify Tables Were Created

```bash
# Connect to database
psql -h localhost -U postgres -d invoica_dev

# List tables
\dt

# Should show:
# - users
# - invoices
# - line_items

# View table structure
\d users
\d invoices

# Exit
\q
```

## Production (Supabase)

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Sign in
3. Create new project:
   - Name: `invoica`
   - Database password: (generate strong password)
   - Region: (closest to you)

### 2. Get Connection String

1. Go to Project Settings → Database
2. Copy the **Connection string** (URI format):
   ```
   postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
   ```
3. Replace `[password]` with your actual password

### 3. Configure for Production

**For Railway Deployment:**

Add environment variables in Railway dashboard:

```bash
DB_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
JWT_SECRET=production-secret-at-least-256-bits-long
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

**For Local Testing with Supabase:**

Update `backend/.env`:
```bash
DB_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
```

### 4. Verify Supabase Connection

1. Start backend with Supabase connection
2. Check Supabase dashboard → Table Editor
3. Should see tables: `users`, `invoices`, `line_items`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255),
    is_guest BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Invoices Table
```sql
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    zip_code VARCHAR(50) NOT NULL,
    country VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company_email VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    primary_color VARCHAR(20) NOT NULL,
    font_family VARCHAR(100) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    email_subject VARCHAR(255),
    email_message TEXT,
    total_amount DECIMAL(19, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Line Items Table
```sql
CREATE TABLE line_items (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL,
    rate DECIMAL(19, 2) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    invoice_id BIGINT NOT NULL,
    CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

## Environment Variables Reference

| Variable | Description | Local Example | Production Example |
|----------|-------------|---------------|-------------------|
| `DB_URL` | Database connection URL | `jdbc:postgresql://localhost:5432/invoica_dev` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres` |
| `DB_USERNAME` | Database username | `postgres` | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` | `your-strong-password` |
| `JWT_SECRET` | Secret key for JWT tokens | `dev-secret-key` | `production-secret-256-bits` |
| `JWT_EXPIRATION` | Token expiration (ms) | `86400000` (24h) | `86400000` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` | `https://app.vercel.app` |

## Troubleshooting

### Connection Refused

**Error:** `Connection refused` or `FATAL: database "invoica_dev" does not exist`

**Solution:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb invoica_dev
```

### Authentication Failed

**Error:** `FATAL: password authentication failed`

**Solution:**
```bash
# Reset password
psql postgres
ALTER USER postgres WITH PASSWORD 'postgres';
\q

# Update .env file with correct password
```

### Tables Not Created

**Error:** Application starts but no tables in database

**Solution:**
- Check `application.yml` has `ddl-auto: update`
- Delete database and recreate:
  ```bash
  dropdb invoica_dev
  createdb invoica_dev
  ```
- Restart backend

### Port Already in Use

**Error:** `Port 5432 is already in use`

**Solution:**
```bash
# Find process using port 5432
lsof -i :5432

# Kill the process
kill -9 <PID>

# Or change PostgreSQL port in postgresql.conf
```

### Supabase Connection Issues

**Error:** `Connection timeout` or `SSL required`

**Solution:**
- Ensure you're using the correct connection string from Supabase
- Add `?sslmode=require` to connection string if needed:
  ```
  jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require
  ```

## Quick Reference

**Start PostgreSQL:**
```bash
brew services start postgresql@15
```

**Stop PostgreSQL:**
```bash
brew services stop postgresql@15
```

**Access Database:**
```bash
psql -d invoica_dev
```

**Common psql Commands:**
```sql
\l              -- List databases
\dt             -- List tables
\d table_name   -- Describe table
\q              -- Quit
```

**Reset Database:**
```bash
dropdb invoica_dev && createdb invoica_dev
```

## Next Steps

After database setup:

1. ✅ Start backend: `./gradlew bootRun`
2. ✅ Verify tables created: `psql -d invoica_dev` then `\dt`
3. ✅ Test authentication: Visit `http://localhost:3000/login`
4. ✅ Create test invoice

**Database is ready!** 🎉
