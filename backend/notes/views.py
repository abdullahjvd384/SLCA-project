"""
Notes API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from notes.models import Note
from notes.schemas import NoteCreate, NoteResponse
from documents.models import Document, ProcessingStatus
from users.auth import get_current_user
from users.models import User
from notes.generator import notes_generator

router = APIRouter(prefix="/api/notes", tags=["notes"])

@router.post("/generate", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def generate_notes(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate notes from document
    
    Args:
        note_data: Note creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Generated notes
    """
    # Check if document exists and belongs to user
    document = db.query(Document).filter(
        Document.id == note_data.document_id,
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
            detail="Please upload and process content first before generating notes"
        )
    
    # Check if content exists
    if not document.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No content available. Please upload content first"
        )
    
    # Generate notes
    try:
        notes_content = notes_generator.generate_notes(
            document.extracted_text,
            note_data.note_type
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate notes: {str(e)}"
        )
    
    # Save notes
    new_note = Note(
        user_id=current_user.id,
        document_id=note_data.document_id,
        note_type=note_data.note_type,
        content=notes_content
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return NoteResponse.from_orm(new_note)

@router.get("/document/{document_id}", response_model=list[NoteResponse])
def get_notes_by_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for a document
    
    Args:
        document_id: Document ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of notes
    """
    notes = db.query(Note).filter(
        Note.document_id == document_id,
        Note.user_id == current_user.id
    ).all()
    
    return [NoteResponse.from_orm(note) for note in notes]
