# 🎓 SLCA - Smart Learning & Career Assistant

> An AI-powered platform that revolutionizes student learning and provides personalized career guidance using Google Gemini AI, RAG pipeline, and comprehensive analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

SLCA (Smart Learning & Career Assistant) is a comprehensive full-stack application that combines AI-powered learning assistance with career guidance. Built with FastAPI backend and Next.js 14 frontend, it helps students:

- 📚 Process and analyze learning materials (8 file formats + URLs)
- 📝 Create smart notes linked to documents
- 📊 Generate AI summaries with multiple formats
- 🎯 Take adaptive quizzes with instant feedback
- 📈 Track detailed learning progress with analytics
- 💼 Get career guidance with resume analysis
- 🎤 Prepare for interviews with AI-generated questions

## ✨ Features

### 🤖 AI-Powered Learning
- **Multi-Format Document Processing**: PDF, DOCX, PPTX, TXT, MD, CSV, XLSX, JSON
- **URL Content Extraction**: Process web pages and articles
- **RAG Pipeline**: Context-aware AI responses using ChromaDB vector search
- **Smart Summaries**: 3 types - Bullet Points, Paragraph, Detailed Analysis
- **Adaptive Quizzes**: AI generates questions based on difficulty and topic
- **Automatic Evaluation**: Instant grading with explanations

### 📊 Progress Tracking
- **Comprehensive Analytics**: Study time, streak, improvement rate
- **Visual Dashboards**: Charts for performance, topics, activity timeline
- **AI Insights**: Personalized recommendations based on performance
- **Topic Mastery**: Granular tracking of understanding per subject

### 💼 Career Guidance
- **Resume Analysis**: AI-powered parsing and assessment
- **Career Recommendations**: Personalized paths based on skills
- **Skill Gap Analysis**: Identify missing skills with learning resources
- **Interview Preparation**: Role-specific questions and STAR framework
- **Practice Mode**: Interactive interview practice sessions

### 🎨 Modern UI/UX
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Feedback**: Toast notifications for all actions
- **Loading States**: Smooth transitions and skeleton loaders
- **Professional Theme**: Clean dashboard with intuitive navigation

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI Engine**: Google Gemini 1.5 Pro
- **Vector DB**: ChromaDB for semantic search
- **Authentication**: JWT with bcrypt
- **File Processing**: Multiple format parsers

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
SLCA-project/
├── backend/                    # FastAPI Backend
│   ├── career/                # Career guidance module
│   ├── config/                # Database & settings
│   ├── core/                  # RAG pipeline & extractors
│   ├── documents/             # Document processing
│   ├── notes/                 # Notes management
│   ├── progress/              # Analytics & tracking
│   ├── quizzes/               # Quiz generation & evaluation
│   ├── summarizer/            # AI summary generation
│   ├── users/                 # Authentication & user management
│   ├── utils/                 # Helper functions & services
│   ├── main.py               # FastAPI app entry point
│   ├── migrate.py            # Database migration CLI
│   ├── run.py                # Startup script
│   └── requirements.txt      # Python dependencies
│
├── frontend/                  # Next.js Frontend
│   ├── app/                   # Next.js App Router
│   │   ├── dashboard/        # Protected dashboard pages
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable components
│   ├── lib/                 # Utilities & API client
│   └── package.json        # Node dependencies
│
└── docs/                    # Documentation
```

## 🚀 Installation

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- PostgreSQL database
- Google Gemini API key

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/abdullahjvd384/SLCA-project.git
cd SLCA-project/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost/slca_db
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

5. **Initialize database**
```bash
python migrate.py init
```

6. **Start the backend server**
```bash
python run.py
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📖 Usage

### Quick Start

1. **Register an account**: Navigate to `http://localhost:3000/register`
2. **Login**: Use your credentials at `/login`
3. **Upload documents**: Go to Documents section and upload learning materials
4. **Create notes**: Link notes to your documents for better organization
5. **Generate summaries**: Get AI-powered summaries in different formats
6. **Take quizzes**: Test your knowledge with adaptive quizzes
7. **Track progress**: View detailed analytics on your dashboard
8. **Career guidance**: Upload resume for personalized career recommendations

### API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key API Endpoints

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user

#### Documents (6 endpoints)
- `POST /api/documents/upload` - Upload file
- `POST /api/documents/process-url` - Process URL
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}` - Get document
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/{id}/download` - Download file

#### Notes (5 endpoints)
- `POST /api/notes/` - Create note
- `GET /api/notes/` - List notes
- `GET /api/notes/{id}` - Get note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

#### Summaries (4 endpoints)
- `POST /api/summaries/generate` - Generate summary
- `GET /api/summaries/` - List summaries
- `GET /api/summaries/{id}` - Get summary
- `DELETE /api/summaries/{id}` - Delete summary

#### Quizzes (7 endpoints)
- `POST /api/quizzes/generate` - Generate quiz
- `GET /api/quizzes/` - List quizzes
- `GET /api/quizzes/{id}` - Get quiz details
- `POST /api/quizzes/{id}/attempt` - Submit quiz attempt
- `GET /api/quizzes/attempts` - List attempts
- `GET /api/quizzes/analytics` - Get quiz analytics
- `DELETE /api/quizzes/{id}` - Delete quiz

#### Progress (2 endpoints)
- `GET /api/progress/analytics` - Get detailed analytics
- `GET /api/progress/ai-insights` - Get AI insights

#### Career (5 endpoints)
- `POST /api/career/analyze-resume` - Upload & analyze resume
- `GET /api/career/analysis` - Get current analysis
- `GET /api/career/recommendations` - Get career recommendations
- `GET /api/career/interview-prep` - Get interview preparation
- `GET /api/career/job-matches` - Get job matches

**Total: 34 API Endpoints**

## 🎨 Frontend Pages

### Public Pages (3)
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Dashboard (14 pages)
- `/dashboard` - Dashboard home
- `/dashboard/documents` - Document management
- `/dashboard/notes` - Notes list
- `/dashboard/notes/new` - Create note
- `/dashboard/summaries` - Summaries list
- `/dashboard/summaries/new` - Generate summary
- `/dashboard/quizzes` - Quizzes list with analytics
- `/dashboard/quizzes/new` - Generate quiz
- `/dashboard/quizzes/[id]` - Take quiz & view results
- `/dashboard/progress` - Progress analytics
- `/dashboard/career` - Career hub
- `/dashboard/career/recommendations` - Career recommendations
- `/dashboard/career/interview-prep` - Interview preparation

**Total: 17 Frontend Pages**

## 🔒 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Protected API endpoints
- Input validation with Pydantic/Zod
- CORS configuration
- SQL injection prevention
- File upload validation

## 📊 Database Schema

### 12 Database Tables
1. **users** - User accounts
2. **documents** - Uploaded files and URLs
3. **notes** - User-created notes
4. **summaries** - AI-generated summaries
5. **quizzes** - Generated quizzes
6. **questions** - Quiz questions
7. **quiz_attempts** - User quiz submissions
8. **quiz_answers** - Individual answers
9. **career_analyses** - Resume analysis results
10. **career_recommendations** - Career path suggestions
11. **skill_gaps** - Missing skills identified
12. **interview_prep** - Interview preparation data

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
```bash
# Requirements
- PostgreSQL database
- Environment variables configured
- Python 3.9+ runtime
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Requirements
- Node.js 18+ runtime
- Environment variable: NEXT_PUBLIC_API_URL
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Abdullah Javed** - *Full Stack Development* - [GitHub](https://github.com/abdullahjvd384)

## 🙏 Acknowledgments

- Google Gemini AI for powering the AI features
- FastAPI for the excellent backend framework
- Next.js team for the amazing React framework
- ChromaDB for vector database capabilities
- All open-source contributors

## 📧 Contact

For questions or support:
- Email: abdullahjvd384@gmail.com
- GitHub: [@abdullahjvd384](https://github.com/abdullahjvd384)

## 📈 Project Statistics

- **Total Files**: 117+
- **Lines of Code**: 25,000+
- **API Endpoints**: 34
- **Frontend Pages**: 17
- **Database Tables**: 12
- **Supported File Formats**: 8
- **Development Time**: Complete Implementation

---

**⭐ If you find this project helpful, please give it a star!**

**🎓 Perfect for Final Year Projects, Learning Management Systems, and Career Development Platforms**
