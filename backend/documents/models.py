"""
Document model for file uploads and content management
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from config.database import Base

class ContentType(str, enum.Enum):
    YOUTUBE = "youtube"
    ARTICLE = "article"
    PDF = "pdf"
    PPT = "ppt"
    IMAGE = "image"
    DOCX = "docx"
    EXCEL = "excel"
    TEXT = "text"

class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500))
    content_type = Column(SQLEnum(ContentType), nullable=False)
    original_filename = Column(String(500))
    file_url = Column(String(1000))
    file_path = Column(String(1000))
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    file_size = Column(Integer)  # in bytes
    processing_status = Column(SQLEnum(ProcessingStatus), default=ProcessingStatus.PENDING)
    vector_db_reference_id = Column(String(255))
    metadata = Column(JSONB)
    extracted_text = Column(Text)  # Store extracted content
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Document {self.title} - {self.content_type}>"
