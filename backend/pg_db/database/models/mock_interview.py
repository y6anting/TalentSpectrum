# backend/pg_db/database/models/mock_interview.py

from database.connection import Base
from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# SQLAlchemy model
class MockInterviewReport(Base):
    __tablename__ = "mock_interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    candidate_email = Column(String, index=True)
    position_title = Column(String)
    position_level = Column(String)
    interview_type = Column(String)  # general, technical, behavioral
    total_questions = Column(Integer)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration_seconds = Column(Integer)
    
    # Overall scores
    overall_score = Column(Float)
    clarity_score = Column(Float)
    relevance_score = Column(Float)
    completeness_score = Column(Float)
    
    # Feedback
    overall_feedback = Column(Text)
    strengths = Column(JSON)  # List of strength points
    improvements = Column(JSON)  # List of improvement areas
    
    # Questions and answers
    questions_data = Column(JSON)  # Array of {question, answer, feedback, score}
    
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic schemas
class QuestionAnswerData(BaseModel):
    question: str
    answer: str
    feedback: Optional[str] = None
    score: Optional[float] = None
    type: Optional[str] = None  # general, technical, behavioral

class MockInterviewReportRequest(BaseModel):
    candidate_email: str
    position_title: str
    position_level: str
    interview_type: str
    total_questions: int
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    overall_score: Optional[float] = None
    clarity_score: Optional[float] = None
    relevance_score: Optional[float] = None
    completeness_score: Optional[float] = None
    overall_feedback: Optional[str] = None
    strengths: List[str] = []
    improvements: List[str] = []
    questions_data: List[QuestionAnswerData] = []

    class Config:
        from_attributes = True

class MockInterviewReportResponse(MockInterviewReportRequest):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
