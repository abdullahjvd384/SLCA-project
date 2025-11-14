"""
Career module schemas
"""
from pydantic import BaseModel, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class ResumeUpload(BaseModel):
    """Schema for resume upload"""
    file_type: str
    
    @validator('file_type')
    def validate_file_type(cls, v):
        allowed_types = ['pdf', 'docx']
        if v not in allowed_types:
            raise ValueError(f'File type must be one of {allowed_types}')
        return v

class ResumeResponse(BaseModel):
    """Schema for resume response"""
    id: uuid.UUID
    user_id: uuid.UUID
    file_path: str
    parsed_content: Dict[str, Any]
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class ResumeAnalysisResponse(BaseModel):
    """Schema for resume analysis response"""
    id: uuid.UUID
    resume_id: uuid.UUID
    ats_score: float
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    keyword_match_score: float
    formatting_score: float
    content_quality_score: float
    analyzed_at: datetime
    
    class Config:
        from_attributes = True

class CareerRecommendationResponse(BaseModel):
    """Schema for career recommendation"""
    id: uuid.UUID
    resume_id: uuid.UUID
    job_titles: List[str]
    skills_to_learn: List[str]
    course_recommendations: List[Dict[str, str]]
    industry_insights: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobMatchRequest(BaseModel):
    """Schema for job matching request"""
    job_description: str
    required_skills: List[str] = []

class JobMatchResponse(BaseModel):
    """Schema for job match response"""
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    recommendations: List[str]
