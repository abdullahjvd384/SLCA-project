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
    Background task to process document - LIGHTWEIGHT VERSION
    For URLs (YouTube/Article): Skip extraction, mark as completed immediately
    For Files: Only index to vector store if needed
    
    Args:
        document_id: Document ID
        db: Database session
    """
    try:
        from utils.logger import logger
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return
        
        # For URLs (YouTube and Articles), skip processing at upload time
        # Content will be extracted on-demand when generating summaries/notes/quizzes
        if doc.content_type in [ContentType.YOUTUBE, ContentType.ARTICLE]:
            logger.info(f"URL document {document_id} - skipping content extraction at upload")
            doc.processing_status = ProcessingStatus.COMPLETED
            doc.doc_metadata = {
                "type": "url",
                "extraction": "on-demand",
                "note": "Content will be extracted when needed for summaries/notes/quizzes"
            }
            db.commit()
            return
        
        # For file uploads, update status to processing
        doc.processing_status = ProcessingStatus.PROCESSING
        db.commit()
        
        # Optional: Index file document to vector store (for semantic search)
        # This is also optional - can be done on-demand
        try:
            result = rag_pipeline.process_document(doc.file_path)
            
            if result.get("success"):
                # Only store vector DB reference and basic metadata
                doc.vector_db_reference_id = result.get("doc_id")
                doc.processing_status = ProcessingStatus.COMPLETED
                doc.doc_metadata = {
                    "indexed": True,
                    "chunk_count": result.get("chunk_count", 0),
                    "indexed_at": str(doc.upload_date)
                }
                logger.info(f"File document {document_id} indexed successfully")
            else:
                # Even if indexing fails, mark as completed since file is uploaded
                doc.processing_status = ProcessingStatus.COMPLETED
                doc.doc_metadata = {
                    "indexed": False, 
                    "note": "File uploaded successfully, indexing skipped"
                }
                logger.warning(f"Document {document_id} indexing skipped: {result.get('error')}")
        except Exception as index_error:
            logger.warning(f"Vector indexing failed for {document_id}: {index_error}")
            # Still mark as completed - file is uploaded and accessible
            doc.processing_status = ProcessingStatus.COMPLETED
            doc.doc_metadata = {
                "indexed": False, 
                "note": "File uploaded successfully, indexing failed but content is accessible"
            }
        
        db.commit()
        
    except Exception as e:
        from utils.logger import logger
        logger.error(f"Error processing document {document_id}: {e}")
        if doc:
            doc.processing_status = ProcessingStatus.FAILED
            doc.doc_metadata = {"error": str(e)}
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
    try:
        from utils.logger import logger
        logger.info(f"File upload started: {file.filename} by user {current_user.email}")
        
        # Validate file
        DocumentValidator.validate_upload(file)
        logger.info(f"File validation passed: {file.filename}")
        
        # Save file
        file_info = upload_handler.save_file(file, current_user.id)
        logger.info(f"File saved successfully: {file_info['file_path']}")
        
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
        
        logger.info(f"Document record created with ID: {new_document.id}")
        
        # Process in background
        background_tasks.add_task(process_document_background, str(new_document.id), db)
        
        return DocumentResponse.from_orm(new_document)
        
    except Exception as e:
        from utils.logger import logger
        logger.error(f"File upload failed: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

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

@router.get("/{document_id}/content")
def get_document_content(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extract and return document content ON-DEMAND
    This endpoint is called only when content is actually needed
    (e.g., generating summary, creating notes, making quiz)
    NOT called during upload - saves database storage
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Extracted content
    """
    from utils.logger import logger
    
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Extract content based on type
    try:
        if doc.content_type == ContentType.YOUTUBE:
            result = rag_pipeline.process_youtube(doc.file_url)
        elif doc.content_type == ContentType.ARTICLE:
            result = rag_pipeline.process_webpage(doc.file_url)
        elif doc.file_path:
            result = upload_handler.extract_content_on_demand(
                doc.file_path, 
                doc.content_type.value
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file path or URL available"
            )
        
        if result.get("success"):
            logger.info(f"Content extracted on-demand for document {document_id}")
            return {
                "document_id": str(doc.id),
                "title": doc.title,
                "content": result.get("text", ""),
                "metadata": result.get("metadata", {}),
                "extracted_at": str(doc.upload_date)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to extract content: {result.get('error')}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting content for {document_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content extraction failed: {str(e)}"
        )
