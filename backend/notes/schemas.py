"""
Notes schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class NoteCreate(BaseModel):
    """Schema for note creation"""
    document_id: uuid.UUID
    note_type: str = "structured"  # structured, bullet, detailed

class NoteResponse(BaseModel):
    """Schema for note response"""
    id: uuid.UUID
    user_id: uuid.UUID
    document_id: uuid.UUID
    note_type: str
    content: str
    generated_at: datetime
    
    class Config:
        from_attributes = True
