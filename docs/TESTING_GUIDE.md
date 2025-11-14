# Testing Guide - SLCA Platform

## Testing Strategy

This guide covers comprehensive testing for all modules of the SLCA platform.

---

## Table of Contents

1. [Setup for Testing](#setup-for-testing)
2. [Manual API Testing](#manual-api-testing)
3. [Automated Testing](#automated-testing)
4. [Module-Specific Tests](#module-specific-tests)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)

---

## Setup for Testing

### Prerequisites
```bash
# Install dependencies
pip install -r requirements.txt

# Install testing tools
pip install pytest pytest-asyncio httpx pytest-cov

# Setup test database
createdb slca_test_db
```

### Environment Configuration
Create `.env.test` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/slca_test_db
SECRET_KEY=test-secret-key-do-not-use-in-production
GOOGLE_API_KEY=your-test-api-key
```

### Start Server
```bash
# Development mode
uvicorn main:app --reload --port 8000

# Access docs
# http://localhost:8000/docs
```

---

## Manual API Testing

### Using Swagger UI (Recommended)
1. Navigate to `http://localhost:8000/docs`
2. Test endpoints interactively
3. View request/response schemas
4. Try different scenarios

### Using cURL

#### 1. User Registration
```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### 2. User Login
```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'
```

Save the `access_token` from response for authenticated requests.

#### 3. Upload Document
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "title=Test Document"
```

#### 4. Generate Notes
```bash
curl -X POST "http://localhost:8000/api/notes/generate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_ids": ["DOCUMENT_UUID"],
    "note_type": "detailed"
  }'
```

#### 5. Generate Quiz
```bash
curl -X POST "http://localhost:8000/api/quizzes/generate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_ids": ["DOCUMENT_UUID"],
    "question_type": "mcq",
    "difficulty": "medium",
    "num_questions": 10
  }'
```

#### 6. Upload Resume
```bash
curl -X POST "http://localhost:8000/api/career/resume/upload" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

---

## Automated Testing

### Create Test Files

#### `tests/test_auth.py`
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/users/register", json={
        "email": "newuser@test.com",
        "password": "password123",
        "first_name": "New",
        "last_name": "User"
    })
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_login_user():
    # First register
    client.post("/api/users/register", json={
        "email": "testlogin@test.com",
        "password": "password123"
    })
    
    # Then login
    response = client.post("/api/users/login", json={
        "email": "testlogin@test.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials():
    response = client.post("/api/users/login", json={
        "email": "nonexistent@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
```

#### `tests/test_documents.py`
```python
import pytest
from fastapi.testclient import TestClient
from main import app
import io

client = TestClient(app)

@pytest.fixture
def auth_token():
    response = client.post("/api/users/register", json={
        "email": f"doctest{id(object())}@test.com",
        "password": "password123"
    })
    return response.json()["access_token"]

def test_upload_document(auth_token):
    file_content = b"Test document content"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    
    response = client.post(
        "/api/documents/upload",
        files=files,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    assert "id" in response.json()

def test_list_documents(auth_token):
    response = client.get(
        "/api/documents/",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

#### `tests/test_quizzes.py`
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@pytest.fixture
def setup_with_document():
    # Register user
    response = client.post("/api/users/register", json={
        "email": f"quiztest{id(object())}@test.com",
        "password": "password123"
    })
    token = response.json()["access_token"]
    
    # Upload document
    files = {"file": ("test.txt", io.BytesIO(b"Python is a programming language"), "text/plain")}
    doc_response = client.post(
        "/api/documents/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    doc_id = doc_response.json()["id"]
    
    return {"token": token, "doc_id": doc_id}

def test_generate_quiz(setup_with_document):
    data = setup_with_document
    
    response = client.post(
        "/api/quizzes/generate",
        json={
            "document_ids": [data["doc_id"]],
            "question_type": "mcq",
            "difficulty": "medium",
            "num_questions": 5
        },
        headers={"Authorization": f"Bearer {data['token']}"}
    )
    assert response.status_code == 201
    assert "questions" in response.json()
```

### Run Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v

# Run and stop on first failure
pytest -x
```

---

## Module-Specific Tests

### 1. Authentication Module
**Tests to Run:**
- ✅ User registration with valid data
- ✅ User registration with duplicate email
- ✅ Login with correct credentials
- ✅ Login with incorrect credentials
- ✅ Access protected endpoint with valid token
- ✅ Access protected endpoint without token
- ✅ Password reset request
- ✅ Password reset with valid token
- ✅ Email verification

**Expected Results:**
- Registration creates user and returns token
- Duplicate email returns 400 error
- Valid login returns token
- Invalid login returns 401 error
- Protected routes require valid token

### 2. Document Management Module
**Tests to Run:**
- ✅ Upload PDF document
- ✅ Upload DOCX document
- ✅ Upload YouTube link
- ✅ Upload web article URL
- ✅ Upload image with OCR
- ✅ Upload invalid file type
- ✅ List all documents
- ✅ Get document by ID
- ✅ Delete document

**Expected Results:**
- Valid uploads return document ID
- Processing status updates correctly
- Invalid file types rejected
- Only owner can access/delete documents

### 3. Notes Generation Module
**Tests to Run:**
- ✅ Generate detailed notes
- ✅ Generate concise notes
- ✅ Generate bullet points
- ✅ Generate from multiple documents
- ✅ Generate with no content
- ✅ List all notes
- ✅ Delete note

**Expected Results:**
- Notes generated with correct type
- Content matches source material
- Error handling for empty content

### 4. Summarization Module
**Tests to Run:**
- ✅ Generate short summary
- ✅ Generate medium summary
- ✅ Generate detailed summary
- ✅ Summarize multiple documents
- ✅ Handle insufficient content

**Expected Results:**
- Summary length matches request
- Key points extracted correctly
- Multiple documents merged properly

### 5. Quiz Generation Module
**Tests to Run:**
- ✅ Generate MCQ quiz
- ✅ Generate short answer quiz
- ✅ Generate true/false quiz
- ✅ Generate fill-in-blank quiz
- ✅ Generate mixed quiz
- ✅ Generate with different difficulties
- ✅ Submit quiz answers
- ✅ Auto-grading accuracy
- ✅ AI evaluation for short answers
- ✅ View quiz history

**Expected Results:**
- Questions match requested type
- Correct number of questions generated
- Grading accurate for objective questions
- Feedback provided for all questions
- History tracks all attempts

### 6. Progress Tracking Module
**Tests to Run:**
- ✅ View user progress
- ✅ Dashboard statistics accuracy
- ✅ Activity logging
- ✅ Streak calculation
- ✅ Performance metrics
- ✅ Quiz performance trends
- ✅ Weekly activity heatmap

**Expected Results:**
- All metrics calculated correctly
- Activities logged with timestamps
- Streaks count consecutive days
- Performance shows improvement

### 7. Career Module
**Tests to Run:**
- ✅ Upload resume (PDF)
- ✅ Upload resume (DOCX)
- ✅ Parse resume correctly
- ✅ Analyze resume
- ✅ ATS score calculation
- ✅ Generate career recommendations
- ✅ Job matching
- ✅ Skills gap analysis

**Expected Results:**
- Resume parsed with contact info
- Skills extracted correctly
- ATS score between 0-100
- Recommendations relevant to skills
- Job match accurate

---

## Performance Testing

### Load Testing with Locust

Create `locustfile.py`:
```python
from locust import HttpUser, task, between

class SLCAUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/users/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        self.token = response.json()["access_token"]
    
    @task(3)
    def list_documents(self):
        self.client.get(
            "/api/documents/",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(2)
    def view_progress(self):
        self.client.get(
            "/api/progress/dashboard",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task(1)
    def list_quizzes(self):
        self.client.get(
            "/api/quizzes/",
            headers={"Authorization": f"Bearer {self.token}"}
        )
```

Run load test:
```bash
pip install locust
locust -f locustfile.py --host=http://localhost:8000
```

### Performance Benchmarks
- **Authentication:** < 200ms
- **Document Upload:** < 5s (depending on file size)
- **Notes Generation:** < 10s
- **Quiz Generation:** < 15s
- **Resume Analysis:** < 10s

---

## Security Testing

### 1. Authentication Security
```bash
# Test JWT token expiration
# Test with expired token
# Test with malformed token
# Test SQL injection in login
```

### 2. Authorization
```bash
# Test accessing other user's documents
# Test deleting other user's quizzes
# Test unauthorized endpoints
```

### 3. Input Validation
```bash
# Test XSS in text fields
# Test file upload limits
# Test invalid file types
# Test SQL injection in search
```

### 4. Rate Limiting
```bash
# Test rapid repeated requests
# Test quiz generation limits
# Test API abuse scenarios
```

---

## Integration Testing

### Full Workflow Test
```python
def test_complete_learning_workflow():
    # 1. Register & Login
    register_response = client.post("/api/users/register", json=user_data)
    token = register_response.json()["access_token"]
    
    # 2. Upload Document
    doc_response = client.post("/api/documents/upload", files=files, headers={"Authorization": f"Bearer {token}"})
    doc_id = doc_response.json()["id"]
    
    # 3. Generate Notes
    notes_response = client.post("/api/notes/generate", json={"document_ids": [doc_id]}, headers={"Authorization": f"Bearer {token}"})
    
    # 4. Generate Quiz
    quiz_response = client.post("/api/quizzes/generate", json=quiz_data, headers={"Authorization": f"Bearer {token}"})
    quiz_id = quiz_response.json()["id"]
    
    # 5. Submit Quiz
    submit_response = client.post(f"/api/quizzes/{quiz_id}/submit", json=answers, headers={"Authorization": f"Bearer {token}"})
    
    # 6. Check Progress
    progress_response = client.get("/api/progress/dashboard", headers={"Authorization": f"Bearer {token}"})
    
    # Verify all steps succeeded
    assert all responses have status 200/201
```

---

## Testing Checklist

### Pre-Deployment Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] API documentation accurate
- [ ] Error handling tested
- [ ] Database migrations work
- [ ] Environment variables validated
- [ ] File uploads work
- [ ] AI features functional
- [ ] Authentication secure
- [ ] Performance acceptable

### Production Readiness
- [ ] HTTPS configured
- [ ] Database backups setup
- [ ] Monitoring configured
- [ ] Logging implemented
- [ ] Rate limiting enabled
- [ ] Error tracking setup
- [ ] API keys secured
- [ ] CORS configured
- [ ] Documentation complete

---

## Troubleshooting

### Common Issues

**Issue:** Database connection failed
**Solution:** Check DATABASE_URL in .env, ensure PostgreSQL running

**Issue:** AI features not working
**Solution:** Verify GOOGLE_API_KEY is valid

**Issue:** File upload fails
**Solution:** Check file size limits and allowed extensions

**Issue:** Tests fail due to database
**Solution:** Use separate test database, reset before each test

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest --cov
```

---

## Next Steps

1. Write comprehensive test suite
2. Setup CI/CD pipeline
3. Configure monitoring and alerts
4. Implement logging
5. Setup staging environment
6. Perform security audit
7. Load testing with realistic data
8. User acceptance testing

---

**Last Updated:** November 2025
**Status:** Ready for Testing
