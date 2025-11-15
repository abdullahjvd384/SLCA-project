"""
Quiz API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from config.database import get_db
from quizzes.models import Quiz, QuizQuestion, QuizAttempt, DifficultyLevel, QuestionType
from quizzes.schemas import (
    QuizCreate, QuizResponse, QuestionResponse, QuizSubmission,
    QuizResultResponse, QuestionFeedback
)
from documents.models import Document, ProcessingStatus
from users.auth import get_current_user
from users.models import User
from quizzes.generator import quiz_generator
from quizzes.evaluator import quiz_evaluator

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

@router.post("/generate", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def generate_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new quiz from documents
    
    Args:
        quiz_data: Quiz creation data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Generated quiz with questions
    """
    # Validate documents
    documents = db.query(Document).filter(
        Document.id.in_([str(doc_id) for doc_id in quiz_data.document_ids]),
        Document.user_id == current_user.id
    ).all()
    
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No documents found"
        )
    
    # Check if all documents are processed
    unprocessed = [doc for doc in documents if doc.processing_status != ProcessingStatus.COMPLETED]
    if unprocessed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All documents must be processed before generating a quiz"
        )
    
    # Combine content from all documents
    combined_content = "\n\n".join([doc.extracted_text for doc in documents if doc.extracted_text])
    
    if len(combined_content) < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient content to generate quiz. Please upload more materials."
        )
    
    # Generate questions based on type
    try:
        if quiz_data.question_type.value == "mcq":
            generated_questions = quiz_generator.generate_mcq_questions(
                combined_content,
                quiz_data.num_questions,
                quiz_data.difficulty.value
            )
        elif quiz_data.question_type.value == "short":
            generated_questions = quiz_generator.generate_short_answer_questions(
                combined_content,
                quiz_data.num_questions,
                quiz_data.difficulty.value
            )
        elif quiz_data.question_type.value == "true_false":
            generated_questions = quiz_generator.generate_true_false_questions(
                combined_content,
                quiz_data.num_questions,
                quiz_data.difficulty.value
            )
        elif quiz_data.question_type.value == "fill_blank":
            generated_questions = quiz_generator.generate_fill_blank_questions(
                combined_content,
                quiz_data.num_questions,
                quiz_data.difficulty.value
            )
        else:  # mixed
            generated_questions = quiz_generator.generate_mixed_questions(
                combined_content,
                quiz_data.num_questions,
                quiz_data.difficulty.value
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )
    
    if not generated_questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate questions. Please try again."
        )
    
    # Create quiz
    new_quiz = Quiz(
        user_id=current_user.id,
        title=quiz_data.title or f"Quiz - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        difficulty_level=DifficultyLevel(quiz_data.difficulty.value),
        question_type=quiz_data.question_type.value,
        document_references=[str(doc_id) for doc_id in quiz_data.document_ids]
    )
    
    db.add(new_quiz)
    db.flush()
    
    # Create questions
    question_objects = []
    for q_data in generated_questions:
        question = QuizQuestion(
            quiz_id=new_quiz.id,
            question_text=q_data['question_text'],
            question_type=QuestionType(q_data['question_type']),
            options=q_data.get('options'),
            correct_answer=q_data['correct_answer'],
            explanation=q_data.get('explanation', ''),
            difficulty=DifficultyLevel(quiz_data.difficulty.value)
        )
        db.add(question)
        question_objects.append(question)
    
    db.commit()
    db.refresh(new_quiz)
    
    # Prepare response
    return QuizResponse(
        id=new_quiz.id,
        user_id=new_quiz.user_id,
        title=new_quiz.title,
        difficulty_level=new_quiz.difficulty_level,
        question_type=new_quiz.question_type,
        created_at=new_quiz.created_at,
        questions=[
            QuestionResponse(
                id=q.id,
                quiz_id=q.quiz_id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=q.options,
                difficulty=q.difficulty
            ) for q in question_objects
        ]
    )

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(
    quiz_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get quiz with questions
    
    Args:
        quiz_id: Quiz ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Quiz with questions
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()
    
    return QuizResponse(
        id=quiz.id,
        user_id=quiz.user_id,
        title=quiz.title,
        difficulty_level=quiz.difficulty_level,
        question_type=quiz.question_type,
        created_at=quiz.created_at,
        questions=[
            QuestionResponse(
                id=q.id,
                quiz_id=q.quiz_id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=q.options,
                difficulty=q.difficulty
            ) for q in questions
        ]
    )

@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit quiz answers and get results
    
    Args:
        quiz_id: Quiz ID
        submission: Quiz submission with answers
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Quiz results with feedback
    """
    # Get quiz and questions
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).all()
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz has no questions"
        )
    
    # Prepare questions for evaluation
    question_data = []
    for q in questions:
        question_data.append({
            'id': q.id,
            'question_text': q.question_text,
            'question_type': q.question_type.value,
            'correct_answer': q.correct_answer,
            'explanation': q.explanation,
            'options': q.options
        })
    
    # Prepare answers for evaluation
    answer_data = [
        {'question_id': str(ans.question_id), 'answer': ans.answer}
        for ans in submission.answers
    ]
    
    # Evaluate quiz
    try:
        evaluation = quiz_evaluator.evaluate_quiz(question_data, answer_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating quiz: {str(e)}"
        )
    
    # Create quiz attempt
    new_attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        score=evaluation['score'],
        total_questions=evaluation['total_questions'],
        answers=[{'question_id': str(a.question_id), 'answer': a.answer} for a in submission.answers],
        completed_at=datetime.now()
    )
    
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    
    # Prepare feedback
    feedback = [
        QuestionFeedback(
            question_id=fb['question_id'],
            question_text=fb['question_text'],
            user_answer=fb['user_answer'],
            correct_answer=fb['correct_answer'],
            is_correct=fb['is_correct'],
            explanation=fb['explanation'],
            points_earned=fb['points_earned'],
            points_possible=fb['points_possible']
        ) for fb in evaluation['feedback']
    ]
    
    return QuizResultResponse(
        attempt_id=new_attempt.id,
        quiz_id=quiz.id,
        score=evaluation['score'],
        total_questions=evaluation['total_questions'],
        correct_answers=evaluation['correct_answers'],
        time_taken=new_attempt.time_taken,
        completed_at=new_attempt.completed_at,
        feedback=feedback
    )

@router.get("/", response_model=List[QuizResponse])
def list_quizzes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all quizzes for current user
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of quizzes
    """
    quizzes = db.query(Quiz).filter(
        Quiz.user_id == current_user.id
    ).order_by(Quiz.created_at.desc()).all()
    
    result = []
    for quiz in quizzes:
        questions = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz.id
        ).all()
        
        result.append(QuizResponse(
            id=quiz.id,
            user_id=quiz.user_id,
            title=quiz.title,
            difficulty_level=quiz.difficulty_level,
            question_type=quiz.question_type,
            created_at=quiz.created_at,
            questions=[
                QuestionResponse(
                    id=q.id,
                    quiz_id=q.quiz_id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options=q.options,
                    difficulty=q.difficulty
                ) for q in questions
            ]
        ))
    
    return result

@router.get("/attempts/history", response_model=List[QuizResultResponse])
def get_quiz_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get quiz attempt history for current user
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of quiz attempts
    """
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.completed_at.desc()).all()
    
    return [
        QuizResultResponse(
            attempt_id=attempt.id,
            quiz_id=attempt.quiz_id,
            score=attempt.score,
            total_questions=attempt.total_questions,
            correct_answers=int(attempt.score / 100 * attempt.total_questions),
            time_taken=attempt.time_taken,
            completed_at=attempt.completed_at,
            feedback=[]
        ) for attempt in attempts
    ]

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a quiz and its questions
    
    Args:
        quiz_id: Quiz ID
        current_user: Current authenticated user
        db: Database session
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Delete associated questions and attempts
    db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).delete()
    db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id).delete()
    
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}
