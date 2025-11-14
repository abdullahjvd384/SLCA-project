# API Documentation

## SLCA Platform - Complete API Reference

### Base URL
```
http://localhost:8000
```

## 1. Authentication Endpoints

### Register User
- **POST** `/api/users/register`
- **Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string"
}
```
- **Response:** `201 Created`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00"
}
```

### Login
- **POST** `/api/users/login`
- **Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response:** `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

### Get Current User
- **GET** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "string",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00"
}
```

---

## 2. Document Management Endpoints

### Upload File
- **POST** `/api/documents/upload`
- **Headers:** `Authorization: Bearer <token>`
- **Request:** `multipart/form-data`
  - `file`: File (PDF, DOCX, PPTX, TXT, CSV, XLSX, PNG, JPG)
  - `title`: string (optional)
- **Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "string",
  "content_type": "pdf",
  "status": "processing",
  "uploaded_at": "2024-01-01T00:00:00"
}
```

### Upload YouTube Video
- **POST** `/api/documents/youtube`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=xxx",
  "title": "string (optional)"
}
```
- **Response:** `201 Created`

### Upload Web Article
- **POST** `/api/documents/web`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "url": "https://example.com/article",
  "title": "string (optional)"
}
```
- **Response:** `201 Created`

### List Documents
- **GET** `/api/documents/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "string",
    "content_type": "pdf",
    "status": "completed",
    "uploaded_at": "2024-01-01T00:00:00"
  }
]
```

### Get Document Details
- **GET** `/api/documents/{document_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Delete Document
- **DELETE** `/api/documents/{document_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `204 No Content`

---

## 3. Notes Generation Endpoints

### Generate Notes
- **POST** `/api/notes/generate`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "document_ids": ["uuid1", "uuid2"],
  "note_type": "detailed"  // detailed, concise, or bullet_points
}
```
- **Response:** `201 Created`
```json
{
  "id": "uuid",
  "note_type": "detailed",
  "content": "Generated notes content...",
  "created_at": "2024-01-01T00:00:00"
}
```

### List Notes
- **GET** `/api/notes/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "note_type": "detailed",
    "content": "Notes content...",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Get Note Details
- **GET** `/api/notes/{note_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Delete Note
- **DELETE** `/api/notes/{note_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `204 No Content`

---

## 4. Summarization Endpoints

### Generate Summary
- **POST** `/api/summarizer/generate`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "document_ids": ["uuid1", "uuid2"],
  "length": "medium"  // short, medium, or detailed
}
```
- **Response:** `201 Created`
```json
{
  "id": "uuid",
  "summary_text": "Generated summary...",
  "length": "medium",
  "created_at": "2024-01-01T00:00:00"
}
```

### List Summaries
- **GET** `/api/summarizer/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Get Summary Details
- **GET** `/api/summarizer/{summary_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Delete Summary
- **DELETE** `/api/summarizer/{summary_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `204 No Content`

---

## 5. Quiz Generation & Evaluation Endpoints

### Generate Quiz
- **POST** `/api/quizzes/generate`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "document_ids": ["uuid1", "uuid2"],
  "question_type": "mcq",  // mcq, short_answer, true_false, fill_blank, mixed
  "difficulty": "medium",  // easy, medium, hard
  "num_questions": 10
}
```
- **Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Quiz Title",
  "questions": [
    {
      "id": "uuid",
      "question_text": "What is...?",
      "question_type": "mcq",
      "options": ["A", "B", "C", "D"],
      "points": 10
    }
  ],
  "created_at": "2024-01-01T00:00:00"
}
```

### Get Quiz
- **GET** `/api/quizzes/{quiz_id}`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Submit Quiz
- **POST** `/api/quizzes/{quiz_id}/submit`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "answers": [
    {
      "question_id": "uuid",
      "answer": "selected option or text answer"
    }
  ]
}
```
- **Response:** `200 OK`
```json
{
  "attempt_id": "uuid",
  "score": 85.5,
  "total_points": 100,
  "feedback": [
    {
      "question_id": "uuid",
      "is_correct": true,
      "points_earned": 10,
      "feedback_text": "Correct!"
    }
  ],
  "completed_at": "2024-01-01T00:00:00"
}
```

### List Quizzes
- **GET** `/api/quizzes/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Get Quiz History
- **GET** `/api/quizzes/attempts/history`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
[
  {
    "attempt_id": "uuid",
    "quiz_id": "uuid",
    "quiz_title": "Quiz Title",
    "score": 85.5,
    "completed_at": "2024-01-01T00:00:00"
  }
]
```

---

## 6. Progress Tracking Endpoints

### Get User Progress
- **GET** `/api/progress/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
{
  "id": "uuid",
  "total_documents": 15,
  "total_notes": 8,
  "total_summaries": 12,
  "total_quizzes_generated": 5,
  "total_quizzes_attempted": 3,
  "average_quiz_score": 82.5,
  "study_streak_days": 7,
  "last_activity_date": "2024-01-01T00:00:00"
}
```

### Get Dashboard Statistics
- **GET** `/api/progress/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
{
  "total_documents": 15,
  "total_notes": 8,
  "total_summaries": 12,
  "total_quizzes_generated": 5,
  "total_quizzes_attempted": 3,
  "average_quiz_score": 82.5,
  "study_streak_days": 7,
  "recent_activities": [...],
  "quiz_performance_trend": [...],
  "document_types_breakdown": {...},
  "weekly_activity": {...}
}
```

### Get Activity History
- **GET** `/api/progress/activities?limit=50`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "activity_type": "upload",
    "activity_details": {...},
    "timestamp": "2024-01-01T00:00:00"
  }
]
```

### Get Performance Metrics
- **GET** `/api/progress/performance`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
{
  "best_score": 95.0,
  "worst_score": 70.0,
  "average_score": 82.5,
  "total_attempts": 10,
  "improvement_rate": 15.5,
  "strong_topics": [],
  "weak_topics": []
}
```

### Refresh Progress
- **POST** `/api/progress/refresh`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

---

## 7. Career Module Endpoints

### Upload Resume
- **POST** `/api/career/resume/upload`
- **Headers:** `Authorization: Bearer <token>`
- **Request:** `multipart/form-data`
  - `file`: Resume file (PDF or DOCX)
- **Response:** `201 Created`
```json
{
  "id": "uuid",
  "file_path": "/path/to/resume.pdf",
  "parsed_content": {
    "email": "user@example.com",
    "phone": "123-456-7890",
    "skills": ["Python", "JavaScript"],
    "education": [...],
    "experience_years": 3
  },
  "uploaded_at": "2024-01-01T00:00:00"
}
```

### Analyze Resume
- **POST** `/api/career/resume/{resume_id}/analyze`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
{
  "id": "uuid",
  "resume_id": "uuid",
  "ats_score": 78.5,
  "strengths": ["Strong technical skills", "Clear formatting"],
  "weaknesses": ["Missing certifications"],
  "improvement_suggestions": ["Add more quantifiable achievements"],
  "keyword_match_score": 75.0,
  "formatting_score": 80.0,
  "content_quality_score": 72.0,
  "analyzed_at": "2024-01-01T00:00:00"
}
```

### Get Career Recommendations
- **GET** `/api/career/resume/{resume_id}/recommendations`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
```json
{
  "id": "uuid",
  "resume_id": "uuid",
  "job_titles": ["Python Developer", "Backend Engineer"],
  "skills_to_learn": ["Docker", "Kubernetes"],
  "course_recommendations": [
    {
      "title": "Complete Python Bootcamp",
      "platform": "Udemy",
      "reason": "Strengthen Python fundamentals"
    }
  ],
  "industry_insights": "AI and ML fields are growing...",
  "created_at": "2024-01-01T00:00:00"
}
```

### Match Job
- **POST** `/api/career/resume/{resume_id}/match-job`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "job_description": "We are looking for a Python developer...",
  "required_skills": ["Python", "Django", "PostgreSQL"]
}
```
- **Response:** `200 OK`
```json
{
  "match_score": 75.0,
  "matched_skills": ["Python"],
  "missing_skills": ["Django", "PostgreSQL"],
  "recommendations": ["Learn Django framework", "Practice SQL"]
}
```

### List Resumes
- **GET** `/api/career/resumes`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### Get Resume Analysis
- **GET** `/api/career/resume/{resume_id}/analysis`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

- Rate limits are applied per user
- Default: 100 requests per minute
- Quiz generation: 10 requests per hour
- Resume analysis: 20 requests per hour

---

## Interactive Documentation

Visit the following URLs when the server is running:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Authentication Flow

1. Register a new user account
2. Login to receive an access token
3. Include the token in the `Authorization` header for all protected endpoints:
   ```
   Authorization: Bearer <your_access_token>
   ```

---

## Common Workflows

### Complete Learning Workflow

1. **Upload Content**
   - POST `/api/documents/upload` (PDF, DOCX, etc.)
   - POST `/api/documents/youtube` (YouTube videos)
   - POST `/api/documents/web` (Web articles)

2. **Generate Study Materials**
   - POST `/api/notes/generate` (Create notes)
   - POST `/api/summarizer/generate` (Create summaries)

3. **Test Knowledge**
   - POST `/api/quizzes/generate` (Create quiz)
   - POST `/api/quizzes/{quiz_id}/submit` (Take quiz)

4. **Track Progress**
   - GET `/api/progress/dashboard` (View statistics)
   - GET `/api/progress/performance` (View performance metrics)

### Career Development Workflow

1. **Upload Resume**
   - POST `/api/career/resume/upload`

2. **Get Analysis**
   - POST `/api/career/resume/{resume_id}/analyze`

3. **Get Recommendations**
   - GET `/api/career/resume/{resume_id}/recommendations`

4. **Match Jobs**
   - POST `/api/career/resume/{resume_id}/match-job`
