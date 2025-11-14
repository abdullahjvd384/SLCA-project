# Student Learning & Career Assistant (SLCA)

A comprehensive AI-powered web platform that assists students in learning and career development through intelligent content processing, progress tracking, and resume optimization.

## 🎯 Features

### Learning Modules
- **📚 Document Management**: Support for YouTube videos, web articles, PDFs, PowerPoint, and images (with OCR)
- **📝 AI-Powered Notes Generation**: Structured, bullet-point, and detailed notes
- **📄 Smart Summarization**: Multiple length options (short, medium, detailed)
- **🎯 Quiz Generation & Evaluation**: MCQs, short answers, true/false, with AI-powered grading
- **📊 Progress Tracking**: Comprehensive analytics and performance insights

### Career Module
- **📋 Resume Analysis**: AI-powered resume evaluation and optimization
- **💡 Personalized Recommendations**: Based on learning achievements and skills
- **📈 ATS Compatibility Check**: Ensure your resume passes applicant tracking systems

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **Vector Database**: ChromaDB
- **AI**: Google Gemini API
- **Authentication**: JWT tokens
- **External APIs**: 
  - Supadata (YouTube transcripts)
  - ExtractorAPI (web content)
  - OCR API (image text extraction)

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS (recommended)
- **State Management**: React Context/Redux
- **API Client**: Axios

## 📁 Project Structure

```
SLCA_FYP/
├── backend/
│   ├── core/                   # RAG pipeline & content extractors
│   ├── users/                  # Authentication & user management
│   ├── documents/              # Document management
│   ├── notes/                  # Notes generation
│   ├── summarizer/             # Summarization
│   ├── quizzes/                # Quiz generation & evaluation
│   ├── progress/               # Progress tracking
│   ├── career/                 # Career module
│   ├── config/                 # Configuration
│   ├── utils/                  # Utilities
│   ├── main.py                 # FastAPI app
│   └── requirements.txt        # Dependencies
│
├── frontend/                   # Next.js frontend (to be setup)
├── docs/                       # Documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- PostgreSQL 13+
- Node.js 18+ (for frontend)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/abdullahjvd384/SLCA-project.git
cd SLCA-project/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configurations
```

5. **Setup PostgreSQL database**
```bash
# Create database
psql -U postgres
CREATE DATABASE slca_db;
CREATE USER slca_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE slca_db TO slca_user;
\q
```

6. **Update DATABASE_URL in .env**
```
DATABASE_URL=postgresql://slca_user:your_password@localhost:5432/slca_db
```

7. **Add API Keys to .env**
- Google Gemini API key
- Supadata API key (for YouTube)
- ExtractorAPI key (for web content)
- OCR API credentials (for image processing)

8. **Run the application**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend Setup (Coming Soon)

```bash
cd frontend
npm install
npm run dev
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile

### Document Management
- `POST /api/documents/upload/file` - Upload document file
- `POST /api/documents/upload/youtube` - Add YouTube video
- `POST /api/documents/upload/web` - Add web article
- `GET /api/documents` - List user documents
- `GET /api/documents/{id}` - Get specific document
- `DELETE /api/documents/{id}` - Delete document

### Notes Generation
- `POST /api/notes/generate` - Generate notes from document
- `GET /api/notes/document/{document_id}` - Get notes for document

### Summarization
- `POST /api/summaries/generate` - Generate summary
- `GET /api/summaries/document/{document_id}` - Get summaries for document

For complete API documentation, visit `/docs` endpoint after running the server.

## 🔑 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/slca_db

# JWT
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# AI Services
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# External APIs
SUPADATA_API_KEY=your-supadata-key
EXTRACTOR_API_KEY=your-extractor-key
OCR_API_KEY=your-ocr-key
OCR_API_SECRET=your-ocr-secret

# File Upload
MAX_FILE_SIZE_MB=50
UPLOAD_FOLDER=uploads/
```

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=.
```

## 📝 Implementation Status

### ✅ Completed
- [x] Project structure setup
- [x] Database models for all modules
- [x] Core RAG pipeline
- [x] Content extractors (YouTube, Web, Documents)
- [x] Authentication system
- [x] Document management API
- [x] Notes generation module
- [x] Summarization module
- [x] Vector store integration

### 🚧 In Progress
- [ ] Quiz generation & evaluation
- [ ] Progress tracking system
- [ ] Career module (resume analysis)
- [ ] Frontend development

### 📋 To Do
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Quiz evaluation with AI
- [ ] Progress dashboard
- [ ] Resume parsing and analysis
- [ ] Unit tests
- [ ] Deployment configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer**: Syed Basit Abbas
- **GitHub**: [@abdullahjvd384](https://github.com/abdullahjvd384)

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- LlamaIndex for RAG implementation
- FastAPI for excellent API framework
- The open-source community

## 📞 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Note**: This is an FYP (Final Year Project). The project is under active development and new features are being added regularly.
