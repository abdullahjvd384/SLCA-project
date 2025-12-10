# SLCA Setup Guide

Complete setup instructions for the Student Learning & Career Assistant platform.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 20.04+
- **RAM**: 8GB (16GB recommended)
- **Storage**: 5GB free space
- **Python**: 3.9 or higher
- **Supabase Account**: Free tier is sufficient
- **Node.js**: 18 or higher (for frontend)

### Software Prerequisites
1. Python 3.9+
2. Supabase account (https://supabase.com)
3. Git
4. pip (Python package manager)
5. Node.js and npm (for frontend)

## Backend Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/abdullahjvd384/SLCA-project.git
cd SLCA-project
```

### Step 2: Supabase Database Setup

1. **Create a Supabase account** at https://supabase.com (if you don't have one)

2. **Create a new project**:
   - Click "New Project"
   - Enter project name (e.g., "SLCA")
   - Set a strong database password
   - Choose a region close to you
   - Wait for project to be ready (~2 minutes)

3. **Get your connection string**:
   - Go to Project Settings > Database
   - Find "Connection string" section
   - Copy the URI mode connection string
   - It looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

4. **Note**: If your password contains special characters, URL-encode them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `$` becomes `%24`

### Step 3: Python Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate
```

### Step 4: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

If you encounter any issues, install core dependencies separately:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary
pip install llama-index langchain langchain-google-genai
pip install python-jose[cryptography] passlib[bcrypt]
```

### Step 5: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configurations:

```env
# Supabase Database Configuration
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# JWT Secret Key (generate a secure random key)
SECRET_KEY=your-very-secure-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Google Gemini API
GOOGLE_API_KEY=your-google-gemini-api-key

# YouTube Transcript API (Supadata)
SUPADATA_API_KEY=your-supadata-api-key

# Web Content Extraction
EXTRACTOR_API_KEY=your-extractor-api-key

# OCR Service
OCR_API_KEY=your-ocr-api-key
OCR_API_SECRET=your-ocr-api-secret

# File Upload Settings
MAX_FILE_SIZE_MB=50
UPLOAD_FOLDER=uploads/

# CORS (add your frontend URL when ready)
FRONTEND_URL=http://localhost:3000
```

### Step 6: Obtain API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `.env` as `GOOGLE_API_KEY`

#### Supadata API Key (YouTube Transcripts)
1. Visit [Supadata](https://supadata.ai/)
2. Sign up and get your API key
3. Add to `.env` as `SUPADATA_API_KEY`

#### ExtractorAPI (Web Content)
1. Visit [ExtractorAPI](https://extractorapi.com/)
2. Sign up for an account
3. Get your API key
4. Add to `.env` as `EXTRACTOR_API_KEY`

#### OCR API (Image Text Extraction)
1. Visit [Image to Text OCR](https://www.imagetotext.com/api)
2. Sign up and get API credentials
3. Add to `.env` as `OCR_API_KEY` and `OCR_API_SECRET`

### Step 7: Initialize Database

The database tables will be created automatically when you first run the application.

### Step 8: Run the Application

```bash
# Make sure you're in the backend directory with activated virtual environment
uvicorn main:app --reload
```

The server will start at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## Frontend Setup (Coming Soon)

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Run Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Testing the Setup

### Test Backend API

1. Open browser: `http://localhost:8000/docs`
2. Test the health check: `http://localhost:8000/health`
3. Try registering a user via Swagger UI

### Test Database Connection

```bash
# From backend directory
python -c "from config.database import engine; print('Database connected!' if engine else 'Failed')"
```

## Common Issues and Solutions

### Issue: PostgreSQL Connection Error
**Solution**: 
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database `slca_db` exists

### Issue: Module Import Errors
**Solution**:
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: API Key Errors
**Solution**:
- Verify all API keys are correctly set in `.env`
- Ensure no quotes around values
- Check API key validity on respective platforms

### Issue: Port Already in Use
**Solution**:
```bash
# Change port in .env
PORT=8001

# Or kill process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### Issue: File Upload Errors
**Solution**:
- Ensure `uploads/` directory exists and has write permissions
- Check `MAX_FILE_SIZE_MB` setting in `.env`

## Development Workflow

1. **Start Backend**:
```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn main:app --reload
```

2. **Start Frontend** (when ready):
```bash
cd frontend
npm run dev
```

3. **Test Changes**:
- Backend: `http://localhost:8000/docs`
- Frontend: `http://localhost:3000`

## Production Deployment (Future)

### Backend Deployment
- Use Gunicorn with Uvicorn workers
- Set up PostgreSQL on cloud (AWS RDS, Heroku Postgres, etc.)
- Configure environment variables on hosting platform
- Set `DEBUG=False` in production

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Set production API URL
- Configure CORS on backend

## Next Steps

1. ✅ Backend is running
2. ✅ Database is configured
3. ✅ API keys are set
4. 🔄 Test API endpoints
5. 🔄 Develop frontend
6. 🔄 Implement remaining features
7. 🔄 Add tests
8. 🔄 Deploy to production

## Support

If you encounter issues:
1. Check this guide thoroughly
2. Review error messages in console
3. Check API documentation at `/docs`
4. Open an issue on GitHub with error details

## Useful Commands

```bash
# Backend
pip list                          # List installed packages
pip freeze > requirements.txt     # Update requirements
python run.py                     # Run server with checks

# Database Management
python migrate.py check           # Check database connection
python migrate.py create          # Create all tables

# Git
git status                        # Check status
git pull origin main              # Update from remote
git add .                         # Stage changes
git commit -m "message"           # Commit changes
```

---

**Last Updated**: December 2025
