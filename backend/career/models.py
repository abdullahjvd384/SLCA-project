"""
Career module models for resume analysis
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.sql import func
import uuid
import enum
from config.database import Base

class RecommendationPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500))
    file_url = Column(String(1000))
    file_path = Column(String(1000))
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    parsed_content = Column(JSONB)
    analysis_score = Column(Float)
    last_analyzed_at = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<Resume {self.filename}>"

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float)
    section_scores = Column(JSONB)  # {"experience": 8.5, "education": 9.0, ...}
    recommendations = Column(JSONB)  # Array of recommendation objects
    keywords_found = Column(ARRAY(String))
    keywords_missing = Column(ARRAY(String))
    ats_score = Column(Float)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ResumeAnalysis {self.id} - Score: {self.overall_score}>"

class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recommendation_type = Column(String(100))
    recommendation_text = Column(Text, nullable=False)
    priority = Column(SQLEnum(RecommendationPriority), default=RecommendationPriority.MEDIUM)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<CareerRecommendation {self.recommendation_type}>"
