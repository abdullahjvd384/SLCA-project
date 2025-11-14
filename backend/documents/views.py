"""
Document API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import validators
from config.database import get_db
from documents.models import Document, ContentType, ProcessingStatus
from documents.schemas import (
    URLUpload, DocumentResponse, DocumentListResponse
)
from documents.validators import DocumentValidator
from documents.upload_handler import upload_handler
from users.auth import get_current_user
from users.models import User
from core.rag_pipeline import rag_pipeline

router = APIRouter(prefix="/api/documents", tags=["documents"])

def process_document_background(document_id: str, db: Session):
    """
    Background task to process document
    
    Args:
        document_id: Document ID
        db: Database session
    """
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return
        
        # Update status to processing
        doc.processing_status = ProcessingStatus.PROCESSING
        db.commit()
        
        # Process based on content type
        if doc.content_type == ContentType.YOUTUBE:
            result = rag_pipeline.process_youtube(doc.file_url)
        elif doc.content_type == ContentType.ARTICLE:
            result = rag_pipeline.process_webpage(doc.file_url)
        else:
            result = rag_pipeline.process_document(doc.file_path)
        
        if result.get("success"):
            doc.extracted_text = result.get("text", "")
            doc.processing_status = ProcessingStatus.COMPLETED
            doc.metadata = result.get("metadata", {})
        else:
            doc.processing_status = ProcessingStatus.FAILED
            doc.metadata = {"error": result.get("error", "Unknown error")}
        
        db.commit()
        
    except Exception as e:
        print(f"Error processing document: {e}")
        if doc:
            doc.processing_status = ProcessingStatus.FAILED
            doc.metadata = {"error": str(e)}
            db.commit()

@router.post("/upload/file", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document file
    
    Args:
        background_tasks: Background tasks
        file: Uploaded file
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document data
    """
    # Validate file
    DocumentValidator.validate_upload(file)
    
    # Save file
    file_info = upload_handler.save_file(file, current_user.id)
    
    # Determine content type
    content_type = DocumentValidator.get_content_type(file.filename)
    
    # Create document record
    new_document = Document(
        user_id=current_user.id,
        title=file.filename,
        content_type=ContentType(content_type),
        original_filename=file.filename,
        file_path=file_info["file_path"],
        file_size=file_info["file_size"],
        processing_status=ProcessingStatus.PENDING
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Process in background
    background_tasks.add_task(process_document_background, str(new_document.id), db)
    
    return DocumentResponse.from_orm(new_document)

@router.post("/upload/youtube", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_youtube(
    background_tasks: BackgroundTasks,
    url_data: URLUpload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload YouTube video URL
    
    Args:
        background_tasks: Background tasks
        url_data: YouTube URL data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document data
    """
    url = str(url_data.url)
    
    # Validate YouTube URL
    if "youtube.com" not in url and "youtu.be" not in url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube URL"
        )
    
    # Create document record
    new_document = Document(
        user_id=current_user.id,
        title=url_data.title or url,
        content_type=ContentType.YOUTUBE,
        file_url=url,
        processing_status=ProcessingStatus.PENDING
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Process in background
    background_tasks.add_task(process_document_background, str(new_document.id), db)
    
    return DocumentResponse.from_orm(new_document)

@router.post("/upload/web", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_web_article(
    background_tasks: BackgroundTasks,
    url_data: URLUpload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload web article URL
    
    Args:
        background_tasks: Background tasks
        url_data: Web article URL data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document data
    """
    url = str(url_data.url)
    
    # Validate URL
    if not validators.url(url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL"
        )
    
    # Create document record
    new_document = Document(
        user_id=current_user.id,
        title=url_data.title or url,
        content_type=ContentType.ARTICLE,
        file_url=url,
        processing_status=ProcessingStatus.PENDING
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Process in background
    background_tasks.add_task(process_document_background, str(new_document.id), db)
    
    return DocumentResponse.from_orm(new_document)

@router.get("/", response_model=DocumentListResponse)
def get_documents(
    page: int = 1,
    page_size: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's documents
    
    Args:
        page: Page number
        page_size: Items per page
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of documents
    """
    # Query documents
    query = db.query(Document).filter(Document.user_id == current_user.id)
    total = query.count()
    
    documents = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return DocumentListResponse(
        documents=[DocumentResponse.from_orm(doc) for doc in documents],
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific document
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Document data
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return DocumentResponse.from_orm(doc)

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete document
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file if exists
    if doc.file_path:
        upload_handler.delete_file(doc.file_path)
    
    # Delete from database
    db.delete(doc)
    db.commit()
    
    return {"message": "Document deleted successfully"}
