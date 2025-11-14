from database.connection import Base
from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
import json

# SQLAlchemy Model for Database
class InterviewReport(Base):
    __tablename__ = "interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    candidate_email = Column(String, index=True, nullable=False)
    position_title = Column(String, nullable=False)
    position_level = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)
    total_questions = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    overall_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    completeness_score = Column(Integer, nullable=True)
    overall_feedback = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)  # List of strengths
    improvements = Column(JSON, nullable=True)  # List of improvements
    questions_data = Column(JSON, nullable=True)  # List of Q&A with feedback
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models for API
class JobPosition(BaseModel):
    title: str
    description: str
    requirements: List[str]
    level: Literal["entry", "mid", "senior"]
    industry: str

class InterviewQuestion(BaseModel):
    id: str
    question: str
    type: Literal["general", "technical", "behavioral"]
    difficulty: Literal["easy", "medium", "hard"]
    expectedDuration: int

class GenerateQuestionsRequest(BaseModel):
    jobPosition: JobPosition
    interviewType: Literal["general", "technical", "behavioral"]
    numberOfQuestions: int = 5

class Answer(BaseModel):
    question: str
    answer: str
    timestamp: datetime

class FeedbackRequest(BaseModel):
    jobPosition: JobPosition
    interviewType: Literal["general", "technical", "behavioral"]
    answers: List[Answer]
class QuestionData(BaseModel):
    question: str
    answer: str
    type: str
    feedback: Optional[str] = None
    score: Optional[int] = None
    hasAudio: Optional[bool] = False

class InterviewReportCreate(BaseModel):
    candidate_email: str
    position_title: str
    position_level: str
    interview_type: str
    total_questions: int
    start_time: str
    end_time: str
    duration_seconds: int
    overall_score: Optional[int] = None
    clarity_score: Optional[int] = None
    relevance_score: Optional[int] = None
    completeness_score: Optional[int] = None
    overall_feedback: Optional[str] = None
    strengths: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    questions_data: Optional[List[QuestionData]] = None

class InterviewReportResponse(BaseModel):
    id: int
    candidate_email: str
    position_title: str
    position_level: str
    interview_type: str
    total_questions: int
    start_time: datetime
    end_time: datetime
    duration_seconds: int
    overall_score: Optional[int]
    clarity_score: Optional[int]
    relevance_score: Optional[int]
    completeness_score: Optional[int]
    overall_feedback: Optional[str]
    strengths: Optional[List[str]]
    improvements: Optional[List[str]]
    questions_data: Optional[List[dict]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True