from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr
from typing import List, Optional

# Assuming Base is imported from database.connection or a similar file in your project
from database.connection import Base # Placeholder import for context

# ===============================================
# SQLAlchemy Model (Database Structure)
# ===============================================

class MatchResult(Base):
    """
    Stores the result of a single AI-driven candidate-to-job match,
    including candidate profile summary, job summary, and AI analysis.
    """
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)

    # --- Candidate Summary Fields (from candidate_summary) ---
    candidate_name = Column(String, index=True, nullable=False)
    candidate_email = Column(String, index=True, nullable=False)
    location = Column(String)
    work_type_preference = Column(String)
    skills = Column(Text) # Stored as a long string/text
    accommodations = Column(Text) # Stored as a long string/text
    communication_preference = Column(String)

    # --- Job/Company Fields (from match data) ---
    job_id = Column(Integer, index=True, nullable=False) # Indexing this for quick lookups
    job_title = Column(String)
    company_name = Column(String, index=True)
    company_email = Column(String)
    company_id = Column(Integer, index=True)

    # --- Score Fields ---
    primary_score = Column(Integer, nullable=False)
    secondary_score = Column(Integer, nullable=False)
    tertiary_score = Column(Integer, nullable=False)
    total_score = Column(Float, nullable=False) # Use Float for precision

    # --- Primary Analysis Fields ---
    primary_matched = Column(Text)
    primary_consider = Column(Text)
    primary_ai_recommendation = Column(Text)

    # --- Secondary Analysis Fields ---
    secondary_matched = Column(Text)
    secondary_consider = Column(Text)
    secondary_ai_recommendation = Column(Text)

    # --- Tertiary Analysis Fields ---
    tertiary_matched = Column(Text)
    tertiary_consider = Column(Text)
    tertiary_ai_recommendation = Column(Text)

# ===============================================
# Pydantic Schemas (Data Validation)
# ===============================================

class MatchAnalysisSchema(BaseModel):
    """Schema for the qualitative analysis of a single match layer."""
    matched: str
    consider: str
    ai_recommendation: str

class MatchDataSchema(BaseModel):
    """Schema for the results of a single candidate-job match."""
    job_id: int
    job_title: str
    company_name: str
    company_id: int
    employer_email: EmailStr # Note: Using EmailStr for validation
    primary_score: int
    secondary_score: int
    tertiary_score: int
    total_score: float
    primary_analysis: MatchAnalysisSchema
    secondary_analysis: MatchAnalysisSchema
    tertiary_analysis: MatchAnalysisSchema

    class Config:
        from_attributes = True

class CandidateSummarySchema(BaseModel):
    """Schema for the candidate summary data included in the match payload."""
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
    """
    The full request payload structure, containing one candidate's details
    and a list of all their matches against jobs.
    """
    candidate_id: str
    candidate_name: str
    candidate_summary: CandidateSummarySchema
    matches: List[MatchDataSchema]

    class Config:
        from_attributes = True

class MatchResultResponse(BaseModel):
    """Schema for returning a single stored match result (summarized)."""
    id: int
    candidate_name: str
    job_title: str
    company_name: str
    total_score: float

    class Config:
        from_attributes = True

# NEW: Schema for returning a single stored match result with ALL data
class MatchResultFullResponse(BaseModel):
    id: int
    candidate_name: str
    candidate_email: EmailStr
    location: Optional[str] = None
    work_type_preference: Optional[str] = None
    skills: Optional[str] = None
    accommodations: Optional[str] = None
    communication_preference: Optional[str] = None

    job_id: int
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    company_email: Optional[EmailStr] = None
    company_id: Optional[int] = None

    primary_score: int
    secondary_score: int
    tertiary_score: int
    total_score: float

    primary_matched: Optional[str] = None
    primary_consider: Optional[str] = None
    primary_ai_recommendation: Optional[str] = None

    secondary_matched: Optional[str] = None
    secondary_consider: Optional[str] = None
    secondary_ai_recommendation: Optional[str] = None

    tertiary_matched: Optional[str] = None
    tertiary_consider: Optional[str] = None
    tertiary_ai_recommendation: Optional[str] = None

    class Config:
        from_attributes = True