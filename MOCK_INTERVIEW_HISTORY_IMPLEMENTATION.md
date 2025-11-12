# Mock Interview History Feature - Implementation Summary

## Overview
Added a complete mock interview history system that stores interview reports in the database and displays them in the candidate dashboard's Report tab.

## Backend Changes

### 1. Database Model (`backend/pg_db/database/models/mock_interview.py`)
Created a new SQLAlchemy model `MockInterviewReport` with the following fields:
- **Identification**: `id`, `candidate_email`
- **Interview Details**: `position_title`, `position_level`, `interview_type`, `total_questions`
- **Timing**: `start_time`, `end_time`, `duration_seconds`
- **Scores**: `overall_score`, `clarity_score`, `relevance_score`, `completeness_score`
- **Feedback**: `overall_feedback`, `strengths` (JSON array), `improvements` (JSON array)
- **Questions**: `questions_data` (JSON array of Q&A with feedback and scores)
- **Metadata**: `created_at`

### 2. API Routes (`backend/pg_db/routers/mock_interview.py`)
Created REST API endpoints:
- **POST `/api/mock-interview/reports`** - Create a new mock interview report
- **GET `/api/mock-interview/reports/{email}`** - Get all reports for a candidate
- **GET `/api/mock-interview/reports/{email}/latest`** - Get the most recent report
- **GET `/api/mock-interview/reports/detail/{report_id}`** - Get specific report by ID
- **DELETE `/api/mock-interview/reports/{report_id}`** - Delete a report

### 3. Main Application (`backend/pg_db/main.py`)
- Imported `mock_interview` model to register with SQLAlchemy
- Registered `mock_interview_router` in the FastAPI app

## Frontend Changes

### 1. Mock Interview Feedback Page (`feedback/page.tsx`)
**New Functionality:**
- Added "Save to History" button with loading and saved states
- Integrated NextAuth to get user email
- `saveToHistory()` function that:
  - Validates user authentication
  - Extracts interview session data
  - Calculates duration from start/end times
  - Formats data for API submission
  - POSTs to `/api/mock-interview/reports`
  - Shows success/error feedback

**UI Updates:**
- Green "Save to History" button with icons
- Disabled state after successful save
- Loading spinner during save operation
- Check mark icon when saved

### 2. Next.js API Routes

**`/api/mock-interview/reports/route.ts`:**
- **POST**: Proxies create report requests to backend
- **GET**: Fetches all reports by email parameter

**`/api/mock-interview/reports/latest/route.ts`:**
- **GET**: Fetches the latest report for a candidate
- Handles 404 when no reports exist

### 3. Report Tab (`Report/page.tsx`)
**Enhanced Features:**
- Added `useSession()` hook to get authenticated user
- **Database Integration**: Fetches latest mock interview report from database
- **Fallback**: Falls back to sessionStorage if no database record exists
- **New Display Fields**:
  - Interview completion date
  - Interview duration in minutes
  - 5-column grid layout for interview details

**Interview Performance Section:**
- Displays data from database (latest report) or sessionStorage
- Shows overall score, position, type, level, question count
- New fields: completion date and duration
- Organized strengths and improvement areas
- Color-coded feedback sections (green for strengths, orange for improvements)

## Data Flow

### Saving Interview Report:
1. User completes mock interview
2. Feedback is generated with AI
3. User clicks "Save to History" button
4. Frontend collects session data + parsed feedback
5. POST request to Next.js API route
6. Next.js proxies to FastAPI backend
7. Backend creates database record
8. Success confirmation shown to user

### Viewing Interview History:
1. User navigates to Report tab
2. Frontend requests latest report via email
3. Next.js API fetches from FastAPI backend
4. Backend queries database for latest record
5. Data rendered in Report tab with details
6. Falls back to sessionStorage if no database record

## Database Schema

```sql
CREATE TABLE mock_interview_reports (
    id SERIAL PRIMARY KEY,
    candidate_email VARCHAR NOT NULL,
    position_title VARCHAR,
    position_level VARCHAR,
    interview_type VARCHAR,
    total_questions INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    overall_score FLOAT,
    clarity_score FLOAT,
    relevance_score FLOAT,
    completeness_score FLOAT,
    overall_feedback TEXT,
    strengths JSON,
    improvements JSON,
    questions_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_email ON mock_interview_reports(candidate_email);
```

## Usage Instructions

### For Users:
1. **Complete Mock Interview**: Answer all questions in the mock interview
2. **Review Feedback**: View AI-generated feedback on the feedback page
3. **Save to History**: Click the green "Save to History" button
4. **View History**: Navigate to the "Report" tab in the dashboard
5. **Latest Report**: The most recent interview performance is automatically displayed

### For Developers:
**To run the backend:**
```bash
cd backend/pg_db
source myvenv/bin/activate  # or myvenv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**To test the API:**
```bash
# Create a report
curl -X POST http://localhost:8000/api/mock-interview/reports \
  -H "Content-Type: application/json" \
  -d @report_data.json

# Get latest report
curl http://localhost:8000/api/mock-interview/reports/user@example.com/latest
```

## Features

✅ **Persistent Storage**: Interview reports stored in PostgreSQL database
✅ **Latest Report Display**: Automatically shows most recent interview in Report tab
✅ **Detailed Metrics**: Scores, strengths, improvements, duration, date
✅ **Dual Source**: Uses database first, falls back to sessionStorage
✅ **User Authentication**: Tied to user email from NextAuth session
✅ **Error Handling**: Graceful fallbacks and user-friendly error messages
✅ **Loading States**: Visual feedback during save operation
✅ **Type Safety**: Full TypeScript typing for all data structures

## Future Enhancements

- 📊 View all interview history (not just latest)
- 📈 Progress tracking over time
- 🔍 Filter by position type or interview type
- 📤 Export reports as PDF
- 📊 Charts and graphs for score trends
- 🔔 Notifications when new feedback is available
- 🎯 Personalized improvement suggestions based on history
