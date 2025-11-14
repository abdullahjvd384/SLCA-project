"""
Career module API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import Optional
from config.database import get_db
from career.models import Resume, ResumeAnalysis, CareerRecommendation
from career.schemas import (
    ResumeResponse, ResumeAnalysisResponse, 
    CareerRecommendationResponse, JobMatchRequest, JobMatchResponse
)
from career.resume_parser import resume_parser
from career.analyzer import resume_analyzer
from career.recommender import career_recommender
from users.auth import get_current_user
from users.models import User
from progress.models import ActivityType
from progress.analytics import progress_analytics
import uuid
import os
from pathlib import Path

router = APIRouter(prefix="/api/career", tags=["career"])

# Upload directory
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/resume/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and parse resume
    
    Args:
        file: Resume file (PDF or DOCX)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Parsed resume data
    """
    # Validate file type
    allowed_extensions = ['.pdf', '.docx']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"
    
    try:
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Parse resume
    try:
        if file_ext == '.pdf':
            parsed_content = resume_parser.parse_pdf(str(file_path))
        else:  # .docx
            parsed_content = resume_parser.parse_docx(str(file_path))
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume: {str(e)}"
        )
    
    # Save to database
    resume = Resume(
        user_id=current_user.id,
        file_path=str(file_path),
        parsed_content=parsed_content
    )
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    # Log activity
    progress_analytics.log_activity(
        db,
        current_user.id,
        ActivityType.RESUME_UPLOADED,
        {'resume_id': str(resume.id), 'filename': file.filename}
    )
    
    return ResumeResponse.from_orm(resume)

@router.post("/resume/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze resume and provide feedback
    
    Args:
        resume_id: Resume ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Resume analysis results
    """
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Perform analysis
    try:
        analysis_results = resume_analyzer.analyze_resume(resume.parsed_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing resume: {str(e)}"
        )
    
    # Save analysis
    analysis = ResumeAnalysis(
        resume_id=resume_id,
        ats_score=analysis_results['ats_score'],
        strengths=analysis_results['strengths'],
        weaknesses=analysis_results['weaknesses'],
        improvement_suggestions=analysis_results['improvement_suggestions'],
        keyword_match_score=analysis_results['keyword_match_score'],
        formatting_score=analysis_results['formatting_score'],
        content_quality_score=analysis_results['content_quality_score']
    )
    
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Log activity
    progress_analytics.log_activity(
        db,
        current_user.id,
        ActivityType.RESUME_ANALYZED,
        {
            'resume_id': str(resume_id),
            'ats_score': analysis_results['ats_score']
        }
    )
    
    return ResumeAnalysisResponse.from_orm(analysis)

@router.get("/resume/{resume_id}/recommendations", response_model=CareerRecommendationResponse)
def get_career_recommendations(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get career recommendations based on resume
    
    Args:
        resume_id: Resume ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Career recommendations
    """
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get or create analysis
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.resume_id == resume_id
    ).first()
    
    if not analysis:
        # Create analysis first
        analysis_results = resume_analyzer.analyze_resume(resume.parsed_content)
        analysis = ResumeAnalysis(
            resume_id=resume_id,
            ats_score=analysis_results['ats_score'],
            strengths=analysis_results['strengths'],
            weaknesses=analysis_results['weaknesses'],
            improvement_suggestions=analysis_results['improvement_suggestions'],
            keyword_match_score=analysis_results['keyword_match_score'],
            formatting_score=analysis_results['formatting_score'],
            content_quality_score=analysis_results['content_quality_score']
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
    
    # Check if recommendations already exist
    existing_recommendation = db.query(CareerRecommendation).filter(
        CareerRecommendation.resume_id == resume_id
    ).first()
    
    if existing_recommendation:
        return CareerRecommendationResponse.from_orm(existing_recommendation)
    
    # Generate recommendations
    try:
        recommendations = career_recommender.generate_recommendations(
            resume.parsed_content,
            {
                'strengths': analysis.strengths,
                'weaknesses': analysis.weaknesses
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )
    
    # Save recommendations
    career_rec = CareerRecommendation(
        resume_id=resume_id,
        job_titles=recommendations['job_titles'],
        skills_to_learn=recommendations['skills_to_learn'],
        course_recommendations=recommendations['course_recommendations'],
        industry_insights=recommendations['industry_insights']
    )
    
    db.add(career_rec)
    db.commit()
    db.refresh(career_rec)
    
    return CareerRecommendationResponse.from_orm(career_rec)

@router.post("/resume/{resume_id}/match-job", response_model=JobMatchResponse)
def match_job(
    resume_id: uuid.UUID,
    request: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Match resume against a job description
    
    Args:
        resume_id: Resume ID
        request: Job match request with description and skills
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Job match analysis
    """
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Perform matching
    try:
        match_results = resume_analyzer.match_job(
            resume.parsed_content,
            request.job_description,
            request.required_skills
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching job: {str(e)}"
        )
    
    return JobMatchResponse(**match_results)

@router.get("/resumes", response_model=list[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all resumes for current user
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of resumes
    """
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.uploaded_at.desc()).all()
    
    return [ResumeResponse.from_orm(resume) for resume in resumes]

@router.get("/resume/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
def get_resume_analysis(
    resume_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get existing resume analysis
    
    Args:
        resume_id: Resume ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Resume analysis
    """
    analysis = db.query(ResumeAnalysis).join(Resume).filter(
        ResumeAnalysis.resume_id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    return ResumeAnalysisResponse.from_orm(analysis)
