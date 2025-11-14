"""
Progress tracking schemas
"""
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
import uuid

class UserProgressResponse(BaseModel):
    """Schema for user progress response"""
    id: uuid.UUID
    user_id: uuid.UUID
    total_documents: int
    total_notes: int
    total_summaries: int
    total_quizzes_generated: int
    total_quizzes_attempted: int
    average_quiz_score: float
    study_streak_days: int
    last_activity_date: datetime
    
    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    """Schema for activity log response"""
    id: uuid.UUID
    user_id: uuid.UUID
    activity_type: str
    activity_details: Dict[str, Any]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    """Schema for dashboard statistics"""
    total_documents: int
    total_notes: int
    total_summaries: int
    total_quizzes_generated: int
    total_quizzes_attempted: int
    average_quiz_score: float
    study_streak_days: int
    recent_activities: List[ActivityLogResponse]
    quiz_performance_trend: List[Dict[str, Any]]
    document_types_breakdown: Dict[str, int]
    weekly_activity: Dict[str, int]

class PerformanceMetrics(BaseModel):
    """Schema for performance metrics"""
    best_score: float
    worst_score: float
    average_score: float
    total_attempts: int
    improvement_rate: float
    strong_topics: List[str]
    weak_topics: List[str]
