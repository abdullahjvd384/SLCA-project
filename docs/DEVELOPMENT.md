# SLCA Development Guide

Complete guide for developing and extending the SLCA platform.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Code Organization](#code-organization)
4. [Adding New Features](#adding-new-features)
5. [Best Practices](#best-practices)
6. [Testing Guide](#testing-guide)
7. [Deployment](#deployment)

## Architecture Overview

### System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │◄────►│   FastAPI    │◄────►│ PostgreSQL  │
│  (Next.js)  │      │   Backend    │      │  Database   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├──────────┐
                            │          │
                      ┌─────▼────┐  ┌──▼──────────┐
                      │ ChromaDB │  │ Gemini API  │
                      │  Vector  │  │ (AI Model)  │
                      │  Store   │  └─────────────┘
                      └──────────┘
```

### Request Flow

```
User Request → FastAPI Router → Auth Middleware → Business Logic → Database/AI → Response
```

## Development Setup

### Required Tools
- **Python 3.9+**: Main language
- **PostgreSQL**: Database
- **VS Code**: Recommended IDE
- **Git**: Version control
- **Postman/Thunder Client**: API testing

### Recommended VS Code Extensions
- Python
- Pylance
- Python Test Explorer
- GitLens
- REST Client
- Database Client

### Environment Setup

1. **Virtual Environment**:
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

2. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

3. **Database Setup**:
```sql
CREATE DATABASE slca_db;
CREATE USER slca_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE slca_db TO slca_user;
```

4. **Environment Variables**:
Copy `.env.example` to `.env` and configure all variables.

## Code Organization

### Directory Structure Explained

```
backend/
├── main.py                 # Application entry point
├── config/
│   ├── settings.py         # Configuration management
│   └── database.py         # Database connection
├── core/                   # Core business logic
│   ├── rag_pipeline.py     # RAG orchestration
│   ├── vector_store.py     # Vector database ops
│   └── content_extractors/ # Content extraction
├── users/                  # User management
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── views.py            # API endpoints
│   └── auth.py             # Authentication logic
├── documents/              # Document management
├── notes/                  # Notes generation
├── summarizer/             # Summarization
├── quizzes/                # Quiz system
├── progress/               # Progress tracking
├── career/                 # Career features
└── utils/                  # Utility functions
```

### Module Pattern

Each module follows this structure:
```
module_name/
├── __init__.py
├── models.py       # Database models
├── schemas.py      # Request/response schemas
├── views.py        # API endpoints (routers)
├── services.py     # Business logic (optional)
└── utils.py        # Helper functions (optional)
```

## Adding New Features

### 1. Adding a New Database Model

**File**: `module_name/models.py`

```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from config.database import Base

class MyModel(Base):
    __tablename__ = "my_table"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<MyModel {self.name}>"
```

### 2. Adding Request/Response Schemas

**File**: `module_name/schemas.py`

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class MyModelCreate(BaseModel):
    """Schema for creating resource"""
    name: str

class MyModelResponse(BaseModel):
    """Schema for response"""
    id: uuid.UUID
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 3. Adding API Endpoints

**File**: `module_name/views.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
from users.auth import get_current_user
from users.models import User
from .models import MyModel
from .schemas import MyModelCreate, MyModelResponse

router = APIRouter(prefix="/api/mymodule", tags=["mymodule"])

@router.post("/", response_model=MyModelResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    data: MyModelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new item"""
    new_item = MyModel(
        name=data.name,
        user_id=current_user.id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return MyModelResponse.from_orm(new_item)

@router.get("/{item_id}", response_model=MyModelResponse)
def get_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific item"""
    item = db.query(MyModel).filter(
        MyModel.id == item_id,
        MyModel.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    return MyModelResponse.from_orm(item)
```

### 4. Register Router in main.py

```python
from module_name.views import router as mymodule_router

app.include_router(mymodule_router)
```

## Best Practices

### 1. Code Style
- Follow PEP 8
- Use type hints
- Write docstrings for all functions
- Use meaningful variable names

```python
# Good
def calculate_user_score(quiz_attempt: QuizAttempt) -> float:
    """
    Calculate the final score for a quiz attempt.
    
    Args:
        quiz_attempt: QuizAttempt instance
        
    Returns:
        Calculated score as percentage
    """
    correct = sum(1 for answer in quiz_attempt.answers if answer.is_correct)
    return (correct / len(quiz_attempt.answers)) * 100

# Bad
def calc(qa):
    c = 0
    for a in qa.ans:
        if a.cor:
            c += 1
    return c / len(qa.ans) * 100
```

### 2. Error Handling

Always provide meaningful error messages:

```python
# Good
if not document:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Document not found or you don't have permission to access it"
    )

# Bad
if not document:
    raise HTTPException(status_code=404, detail="Error")
```

### 3. Database Queries

Use efficient queries and proper filtering:

```python
# Good - Optimized query
documents = db.query(Document)\
    .filter(Document.user_id == current_user.id)\
    .filter(Document.processing_status == ProcessingStatus.COMPLETED)\
    .order_by(Document.created_at.desc())\
    .limit(10)\
    .all()

# Bad - Fetching all then filtering
all_docs = db.query(Document).all()
user_docs = [d for d in all_docs if d.user_id == current_user.id]
```

### 4. Authentication

Always protect endpoints that require authentication:

```python
@router.get("/protected")
def protected_endpoint(current_user: User = Depends(get_current_user)):
    """This endpoint requires authentication"""
    return {"message": f"Hello {current_user.email}"}
```

### 5. Async Operations

Use background tasks for long operations:

```python
from fastapi import BackgroundTasks

@router.post("/process")
async def process_document(
    background_tasks: BackgroundTasks,
    document: Document
):
    background_tasks.add_task(long_processing_function, document)
    return {"message": "Processing started"}
```

## Testing Guide

### Unit Tests

Create tests in `tests/` directory:

```python
# tests/test_users.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_user_registration():
    response = client.post("/api/users/register", json={
        "email": "test@example.com",
        "password": "password123",
        "first_name": "Test"
    })
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_user_login():
    response = client.post("/api/users/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_users.py

# Run specific test
pytest tests/test_users.py::test_user_registration
```

## API Development Tips

### 1. Use Swagger UI
- Visit `http://localhost:8000/docs`
- Test endpoints interactively
- View request/response schemas

### 2. API Versioning
```python
router = APIRouter(prefix="/api/v1/users", tags=["users-v1"])
```

### 3. Pagination
```python
@router.get("/")
def list_items(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    items = db.query(Model).offset(skip).limit(page_size).all()
    total = db.query(Model).count()
    
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "pages": (total + page_size - 1) // page_size
    }
```

### 4. Request Validation
```python
from pydantic import BaseModel, validator, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    age: int
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
    
    @validator('age')
    def validate_age(cls, v):
        if v < 13:
            raise ValueError('Must be at least 13 years old')
        return v
```

## Debugging Tips

### 1. Enable Debug Mode
```python
# In settings.py
DEBUG = True

# In main.py
app = FastAPI(debug=True)
```

### 2. Logging
```python
import logging

logger = logging.getLogger(__name__)

@router.post("/")
def create_item(data: dict):
    logger.info(f"Creating item with data: {data}")
    try:
        # ... logic
        logger.info("Item created successfully")
    except Exception as e:
        logger.error(f"Error creating item: {e}")
        raise
```

### 3. Database Query Debugging
```python
# In database.py
engine = create_engine(
    DATABASE_URL,
    echo=True  # Prints all SQL queries
)
```

## Deployment

### Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Variables for Production
```env
DEBUG=False
DATABASE_URL=postgresql://user:pass@production-db:5432/slca_db
SECRET_KEY=very-secure-production-key
```

## Common Patterns

### 1. Service Layer Pattern
```python
# services.py
class UserService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate):
        # Business logic here
        user = User(**user_data.dict())
        db.add(user)
        db.commit()
        return user

# views.py
@router.post("/")
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return UserService.create_user(db, data)
```

### 2. Dependency Injection
```python
def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Pydantic**: https://docs.pydantic.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

**Happy Coding!** 🚀

For questions, refer to other documentation files or open an issue on GitHub.
