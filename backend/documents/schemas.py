"""
Document schemas for request/response validation
"""
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class ContentTypeEnum(str, Enum):
    YOUTUBE = "youtube"
    ARTICLE = "article"
    PDF = "pdf"
    PPT = "ppt"
    IMAGE = "image"
    DOCX = "docx"
    EXCEL = "excel"
    TEXT = "text"

class ProcessingStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentUpload(BaseModel):
    """Schema for document upload"""
    title: Optional[str] = None

class URLUpload(BaseModel):
    """Schema for URL-based upload (YouTube/Web)"""
    url: HttpUrl
    title: Optional[str] = None

class DocumentResponse(BaseModel):
    """Schema for document response"""
    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str]
    content_type: ContentTypeEnum
    original_filename: Optional[str]
    file_url: Optional[str]
    upload_date: datetime
    file_size: Optional[int]
    processing_status: ProcessingStatusEnum
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    """Schema for document list response"""
    documents: list[DocumentResponse]
    total: int
    page: int
    page_size: int
