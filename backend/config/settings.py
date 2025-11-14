"""
Application settings and configuration
"""
import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # App Configuration
    APP_NAME: str = "Student Learning & Career Assistant"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://slca_user:password@localhost:5432/slca_db")
    
    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", 24))
    
    # AI Services
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "models/text-embedding-004")
    
    # External APIs
    SUPADATA_API_KEY: str = os.getenv("SUPADATA_API_KEY", "")
    EXTRACTOR_API_KEY: str = os.getenv("EXTRACTOR_API_KEY", "")
    OCR_API_KEY: str = os.getenv("OCR_API_KEY", "")
    OCR_API_SECRET: str = os.getenv("OCR_API_SECRET", "")
    OCR_API_URL: str = os.getenv("OCR_API_URL", "https://www.imagetotext.com/api/ocr")
    OCR_SERVICE: str = os.getenv("OCR_SERVICE", "api")
    
    # Vector Database
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./vector_store")
    
    # File Upload Configuration
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", 50))
    UPLOAD_FOLDER: Path = Path(os.getenv("UPLOAD_FOLDER", "uploads"))
    ALLOWED_EXTENSIONS: List[str] = os.getenv(
        "ALLOWED_EXTENSIONS", 
        "pdf,docx,pptx,jpg,jpeg,png,txt,xlsx,csv"
    ).split(",")
    
    # Email Configuration
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@slca.com")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Global settings instance
settings = Settings()

# Ensure upload directory exists
settings.UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
