from database.connection import Base
from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# SQLAlchemy models
class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, index=True)  # String to support various ID formats
    candidate_name = Column(String)
    candidate_email = Column(String, index=True)
    
    job_id = Column(Integer, index=True)
    job_title = Column(String)
    company_name = Column(String)
    company_id = Column(Integer, index=True)
    employer_email = Column(String)
    
    # Scores
    primary_score = Column(Integer)  # 0-100
    secondary_score = Column(Integer)  # 0-100
    tertiary_score = Column(Integer)  # 0-100
    total_score = Column(Float)  # Weighted average
    
    # Analysis (stored as JSON)
    primary_analysis = Column(JSON)  # {matched, consider, ai_recommendation}
    secondary_analysis = Column(JSON)
    tertiary_analysis = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Pydantic schemas for API requests and responses
class MatchAnalysisSchema(BaseModel):
    """Schema for the qualitative analysis of a single match layer."""
    matched: str
    consider: str
    ai_recommendation: str

    class Config:
        from_attributes = True


class JobMatchData(BaseModel):
    """Schema for a single job match within a candidate's results."""
    job_id: int
    job_title: str
    company_name: str
    company_id: int
    employer_email: EmailStr
    primary_score: int
    secondary_score: int
    tertiary_score: int
    total_score: float
    primary_analysis: MatchAnalysisSchema
    secondary_analysis: MatchAnalysisSchema
    tertiary_analysis: MatchAnalysisSchema

    class Config:
        from_attributes = True


class CandidateSummary(BaseModel):
    """Schema for candidate summary information."""
    name: str
    email: EmailStr
    location: str
    work_type_preference: str
    skills: str
    accommodations: str
    communication_preference: str

    class Config:
        from_attributes = True


class CandidateMatchResultCreate(BaseModel):
    """Schema for creating match results for a single candidate."""
    candidate_id: str
    candidate_name: str
    candidate_summary: CandidateSummary
    matches: List[JobMatchData]

    class Config:
        from_attributes = True


class MatchResultResponse(BaseModel):
    """Schema for returning a single match result."""
    id: int
    candidate_id: str
    candidate_name: str
    candidate_email: str
    job_id: int
    job_title: str
    company_name: str
    company_id: int
    employer_email: str
    primary_score: int
    secondary_score: int
    tertiary_score: int
    total_score: float
    primary_analysis: Dict[str, Any]
    secondary_analysis: Dict[str, Any]
    tertiary_analysis: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MatchResultListResponse(BaseModel):
    """Schema for listing match results."""
    results: List[MatchResultResponse]
    total_count: int

    class Config:
        from_attributes = True
