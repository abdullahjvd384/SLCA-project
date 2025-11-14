"""
Summary API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from summarizer.models import Summary
from summarizer.schemas import SummaryCreate, SummaryResponse
from documents.models import Document, ProcessingStatus
from users.auth import get_current_user
from users.models import User
from summarizer.summarizer import summarizer

router = APIRouter(prefix="/api/summaries", tags=["summaries"])

@router.post("/generate", response_model=SummaryResponse, status_code=status.HTTP_201_CREATED)
def generate_summary(
    summary_data: SummaryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate summary from document
    
    Args:
        summary_data: Summary creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Generated summary
    """
    # Check if document exists and belongs to user
    document = db.query(Document).filter(
        Document.id == summary_data.document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if document is processed
    if document.processing_status != ProcessingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content available for summarization. Please upload documents first."
        )
    
    # Check if content exists
    if not document.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content available. Please upload content first"
        )
    
    # Check minimum content length
    if len(document.extracted_text) < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum 500 words required for summarization"
        )
    
    # Generate summary
    try:
        summary_text = summarizer.generate_summary(
            document.extracted_text,
            summary_data.summary_length.value
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}"
        )
    
    # Save summary
    new_summary = Summary(
        user_id=current_user.id,
        document_id=summary_data.document_id,
        summary_text=summary_text,
        summary_length=summary_data.summary_length
    )
    
    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)
    
    return SummaryResponse.from_orm(new_summary)

@router.get("/document/{document_id}", response_model=list[SummaryResponse])
def get_summaries_by_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all summaries for a document
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of summaries
    """
    summaries = db.query(Summary).filter(
        Summary.document_id == document_id,
        Summary.user_id == current_user.id
    ).all()
    
    return [SummaryResponse.from_orm(summary) for summary in summaries]
