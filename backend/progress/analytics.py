"""
Progress analytics service
"""
from typing import Dict, List, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from progress.models import UserProgress, ActivityLog, ActivityType
from documents.models import Document
from notes.models import Note
from summarizer.models import Summary
from quizzes.models import Quiz, QuizAttempt
import uuid

class ProgressAnalytics:
    """Analytics service for progress tracking"""
    
    @staticmethod
    def get_or_create_progress(db: Session, user_id: uuid.UUID) -> UserProgress:
        """Get or create user progress record"""
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user_id
        ).first()
        
        if not progress:
            progress = UserProgress(user_id=user_id)
            db.add(progress)
            db.commit()
            db.refresh(progress)
        
        return progress
    
    @staticmethod
    def update_progress(db: Session, user_id: uuid.UUID):
        """Update user progress statistics"""
        progress = ProgressAnalytics.get_or_create_progress(db, user_id)
        
        # Count documents
        total_docs = db.query(func.count(Document.id)).filter(
            Document.user_id == user_id
        ).scalar()
        
        # Count notes
        total_notes = db.query(func.count(Note.id)).filter(
            Note.user_id == user_id
        ).scalar()
        
        # Count summaries
        total_summaries = db.query(func.count(Summary.id)).filter(
            Summary.user_id == user_id
        ).scalar()
        
        # Count quizzes
        total_quizzes = db.query(func.count(Quiz.id)).filter(
            Quiz.user_id == user_id
        ).scalar()
        
        # Count quiz attempts
        total_attempts = db.query(func.count(QuizAttempt.id)).filter(
            QuizAttempt.user_id == user_id
        ).scalar()
        
        # Calculate average quiz score
        avg_score = db.query(func.avg(QuizAttempt.score)).filter(
            QuizAttempt.user_id == user_id
        ).scalar()
        
        # Calculate study streak
        streak = ProgressAnalytics._calculate_streak(db, user_id)
        
        # Update progress
        progress.total_documents = total_docs or 0
        progress.total_notes = total_notes or 0
        progress.total_summaries = total_summaries or 0
        progress.total_quizzes_generated = total_quizzes or 0
        progress.total_quizzes_attempted = total_attempts or 0
        progress.average_quiz_score = round(avg_score or 0.0, 2)
        progress.study_streak_days = streak
        progress.last_activity_date = datetime.now()
        
        db.commit()
        db.refresh(progress)
        
        return progress
    
    @staticmethod
    def _calculate_streak(db: Session, user_id: uuid.UUID) -> int:
        """Calculate study streak in days"""
        activities = db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.timestamp.desc()).all()
        
        if not activities:
            return 0
        
        streak = 1
        current_date = activities[0].timestamp.date()
        
        for activity in activities[1:]:
            activity_date = activity.timestamp.date()
            diff = (current_date - activity_date).days
            
            if diff == 1:
                streak += 1
                current_date = activity_date
            elif diff > 1:
                break
        
        return streak
    
    @staticmethod
    def log_activity(
        db: Session, 
        user_id: uuid.UUID, 
        activity_type: ActivityType, 
        details: Dict[str, Any]
    ):
        """Log user activity"""
        activity = ActivityLog(
            user_id=user_id,
            activity_type=activity_type,
            activity_details=details
        )
        db.add(activity)
        db.commit()
        
        # Update progress after logging activity
        ProgressAnalytics.update_progress(db, user_id)
    
    @staticmethod
    def get_recent_activities(
        db: Session, 
        user_id: uuid.UUID, 
        limit: int = 10
    ) -> List[ActivityLog]:
        """Get recent activities"""
        return db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    
    @staticmethod
    def get_quiz_performance_trend(
        db: Session, 
        user_id: uuid.UUID
    ) -> List[Dict[str, Any]]:
        """Get quiz performance trend over time"""
        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id
        ).order_by(QuizAttempt.completed_at).all()
        
        return [
            {
                'date': attempt.completed_at.strftime('%Y-%m-%d'),
                'score': attempt.score,
                'quiz_id': str(attempt.quiz_id)
            }
            for attempt in attempts
        ]
    
    @staticmethod
    def get_document_types_breakdown(
        db: Session, 
        user_id: uuid.UUID
    ) -> Dict[str, int]:
        """Get breakdown of document types"""
        documents = db.query(
            Document.content_type,
            func.count(Document.id)
        ).filter(
            Document.user_id == user_id
        ).group_by(Document.content_type).all()
        
        return {doc_type.value: count for doc_type, count in documents}
    
    @staticmethod
    def get_weekly_activity(
        db: Session, 
        user_id: uuid.UUID
    ) -> Dict[str, int]:
        """Get activity count for the past 7 days"""
        today = datetime.now()
        week_ago = today - timedelta(days=7)
        
        activities = db.query(
            func.date(ActivityLog.timestamp),
            func.count(ActivityLog.id)
        ).filter(
            ActivityLog.user_id == user_id,
            ActivityLog.timestamp >= week_ago
        ).group_by(func.date(ActivityLog.timestamp)).all()
        
        result = {}
        for i in range(7):
            date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
            result[date] = 0
        
        for date, count in activities:
            result[date.strftime('%Y-%m-%d')] = count
        
        return result
    
    @staticmethod
    def get_performance_metrics(
        db: Session, 
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        """Get detailed performance metrics"""
        attempts = db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id
        ).all()
        
        if not attempts:
            return {
                'best_score': 0.0,
                'worst_score': 0.0,
                'average_score': 0.0,
                'total_attempts': 0,
                'improvement_rate': 0.0,
                'strong_topics': [],
                'weak_topics': []
            }
        
        scores = [attempt.score for attempt in attempts]
        
        # Calculate improvement rate (last 5 vs first 5)
        improvement_rate = 0.0
        if len(attempts) >= 5:
            first_5_avg = sum(scores[:5]) / 5
            last_5_avg = sum(scores[-5:]) / 5
            improvement_rate = ((last_5_avg - first_5_avg) / first_5_avg * 100) if first_5_avg > 0 else 0
        
        # Analyze topics/quiz performance for strong and weak areas
        topic_scores = {}  # topic -> list of scores
        for attempt in attempts:
            quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
            if quiz and quiz.title:
                # Extract topic from quiz title or use full title
                topic = quiz.title
                if topic not in topic_scores:
                    topic_scores[topic] = []
                topic_scores[topic].append(attempt.score)
        
        # Calculate average score per topic
        topic_averages = {topic: sum(scores) / len(scores) for topic, scores in topic_scores.items()}
        
        # Identify strong topics (score >= 80) and weak topics (score < 60)
        strong_topics = [topic for topic, avg in topic_averages.items() if avg >= 80]
        weak_topics = [topic for topic, avg in topic_averages.items() if avg < 60]
        
        return {
            'best_score': max(scores),
            'worst_score': min(scores),
            'average_score': sum(scores) / len(scores),
            'total_attempts': len(attempts),
            'improvement_rate': round(improvement_rate, 2),
            'strong_topics': strong_topics[:5],  # Top 5 strong topics
            'weak_topics': weak_topics[:5]  # Top 5 weak topics
        }

# Global analytics instance
progress_analytics = ProgressAnalytics()
