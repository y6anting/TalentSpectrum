from database.connection import Base
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# SQLAlchemy model for Shortlisted Candidates
class ShortlistedCandidate(Base):
    __tablename__ = "shortlisted_candidates"

    id = Column(Integer, primary_key=True, index=True)
    employer_email = Column(String, nullable=False, index=True)
    candidate_id = Column(Integer, nullable=False)
    candidate_name = Column(String, nullable=False)
    candidate_email = Column(String, nullable=False)
    job_id = Column(Integer, nullable=False)
    job_title = Column(String, nullable=False)
    applied_date = Column(String, nullable=False)  # ISO date string
    status = Column(String, default="shortlisted")  # shortlisted, interview_scheduled, under_review, etc.
    accommodations_requested = Column(Boolean, default=False)
    accommodation_details = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)  # Match percentage
    interview_date = Column(DateTime, nullable=True)  # Interview date and time
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic schema for creating a shortlisted candidate
class ShortlistRequest(BaseModel):
    employer_email: str
    candidate_id: int
    candidate_name: str
    candidate_email: str
    job_id: int
    job_title: str
    applied_date: str
    status: Optional[str] = "shortlisted"
    accommodations_requested: Optional[bool] = False
    accommodation_details: Optional[str] = None
    experience: Optional[str] = None
    score: Optional[int] = None
    interview_date: Optional[datetime] = None

    class Config:
        from_attributes = True

# Pydantic schema for response
class ShortlistResponse(BaseModel):
    id: int
    employer_email: str
    candidate_id: int
    candidate_name: str
    candidate_email: str
    job_id: int
    job_title: str
    applied_date: str
    status: str
    accommodations_requested: bool
    accommodation_details: Optional[str]
    experience: Optional[str]
    score: Optional[int]
    interview_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
