# SLCA Quick Start Guide

This guide will get you up and running with the SLCA platform in minutes.

## Prerequisites Checklist

Before you begin, ensure you have:
- [ ] Python 3.9+ installed
- [ ] Supabase account created (https://supabase.com)
- [ ] Git installed
- [ ] Google Gemini API key
- [ ] Internet connection for API access

## 5-Minute Quick Setup

### 1. Clone and Navigate (30 seconds)

```bash
git clone https://github.com/abdullahjvd384/SLCA-project.git
cd SLCA-project/backend
```

### 2. Create Virtual Environment (30 seconds)

**Windows:**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies (2 minutes)

```bash
pip install -r requirements.txt
```

### 4. Setup Supabase Database (1 minute)

1. Create a Supabase project at https://supabase.com
2. Get your connection string from Project Settings > Database
3. Copy to your `.env` file (see next step)
GRANT ALL PRIVILEGES ON DATABASE slca_db TO slca_user;
\q
```

### 5. Configure Environment (1 minute)

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env` and add minimum required values:
```env
# Your Supabase connection string
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SECRET_KEY=your-secret-key-here-change-this
GOOGLE_API_KEY=your-gemini-api-key
```

### 5. Initialize Database (30 seconds)

```bash
python migrate.py create
```

### 6. Run the Server (30 seconds)

```bash
uvicorn main:app --reload
```

✅ **Done!** Visit `http://localhost:8000/docs` to see your API.

## Essential API Keys

You need at least these keys to get started:

### 1. Google Gemini API (Required - Free)
- Visit: https://makersuite.google.com/app/apikey
- Click "Create API Key"
- Copy and paste into `.env` as `GOOGLE_API_KEY`

### 2. Supadata API (Optional - for YouTube)
- Visit: https://supadata.ai/
- Sign up for free account
- Get API key from dashboard
- Add to `.env` as `SUPADATA_API_KEY`

### 3. ExtractorAPI (Optional - for Web scraping)
- Visit: https://extractorapi.com/
- Free tier available
- Add to `.env` as `EXTRACTOR_API_KEY`

### 4. OCR API (Optional - for images)
- Visit: https://www.imagetotext.com/api
- Get free API credentials
- Add to `.env`

## Testing Your Setup

### 1. Check Health Endpoint
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 2. Test User Registration

Visit `http://localhost:8000/docs` and try:
- Expand `POST /api/users/register`
- Click "Try it out"
- Enter test data:
```json
{
  "email": "test@example.com",
  "password": "password123",
  "first_name": "Test",
  "last_name": "User"
}
```
- Click "Execute"
- You should get a token in response

### 3. Upload a Document

Use the token from step 2:
- Click on the lock icon 🔒 in Swagger UI
- Paste your token (without "Bearer")
- Try `POST /api/documents/upload/file`

## Common Quick Fixes

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*
# If not running:
Start-Service postgresql-x64-13

# macOS:
brew services list
brew services start postgresql

# Linux:
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### "Module not found" errors
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### "Port already in use"
```bash
# Change port in main.py or use different port:
uvicorn main:app --reload --port 8001
```

## What You Can Do Now

With the basic setup, you can:

✅ **Register users** - Create accounts with email/password
✅ **Upload documents** - PDF, DOCX, PPTX, images
✅ **Generate notes** - AI-powered note creation
✅ **Create summaries** - Different length summaries
✅ **Upload YouTube videos** - Extract and process transcripts (with API key)
✅ **Scrape web articles** - Extract content from URLs (with API key)

## Next Steps

1. **Get all API keys** for full functionality
2. **Explore the API docs** at `/docs`
3. **Test all endpoints** with sample data
4. **Set up frontend** (coming soon)
5. **Implement quiz module** (in progress)
6. **Add progress tracking** (in progress)

## Project Structure Overview

```
backend/
├── main.py              # ⭐ Start here - FastAPI app
├── config/              # ⚙️ Settings and database
├── users/               # 👤 Authentication
├── documents/           # 📁 File uploads
├── notes/               # 📝 Notes generation
├── summarizer/          # 📄 Summarization
├── core/                # 🧠 RAG pipeline
│   └── content_extractors/  # YouTube, Web, Docs
└── utils/               # 🔧 Helpers (Gemini client)
```

## Quick Commands Reference

```bash
# Activate environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Run server
python run.py

# Run with uvicorn directly
uvicorn main:app --reload --port 8000

# Install new package
pip install package-name
pip freeze > requirements.txt

# Database operations
python migrate.py check    # Check database connection
python migrate.py create   # Create all tables

# Git operations
git status
git add .
git commit -m "message"
git push origin main
```

## Troubleshooting Resources

- **API Documentation**: http://localhost:8000/docs
- **Setup Guide**: `/docs/SETUP.md`
- **README**: `/README.md`
- **GitHub Issues**: https://github.com/abdullahjvd384/SLCA-project/issues

## Getting Help

1. Check error messages in terminal
2. Review API documentation at `/docs`
3. Check setup guide for detailed instructions
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Python version)

---

**You're all set!** 🎉 Start building with SLCA.

For detailed documentation, see `docs/SETUP.md` and `README.md`.
