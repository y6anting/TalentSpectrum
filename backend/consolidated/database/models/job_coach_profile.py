from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, JSON, String

from database.connection import Base


class JobCoachProfile(Base):
    """
    Profile for Job Coaches - stores their professional information,
    specializations, and assigned candidates.
    """

    __tablename__ = "job_coach_profiles"

    id = Column(Integer, primary_key=True, index=True)
    coach_email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    organization = Column(String, nullable=True)
    specializations = Column(JSON, nullable=False, default=list)  # Areas of expertise
    certifications = Column(JSON, nullable=True)  # Professional certifications
    bio = Column(String, nullable=True)  # Professional bio
    experience_years = Column(Integer, nullable=True)
    profile_picture_url = Column(String, nullable=True)  # Profile picture URL
    assigned_candidates = Column(JSON, nullable=False, default=list)  # List of candidate emails
    availability = Column(JSON, nullable=True)  # Schedule/availability info
    contact_preferences = Column(JSON, nullable=True)  # Preferred contact methods
    profile_completion = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class JobCoachProfileBase(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    specializations: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    assigned_candidates: Optional[List[str]] = None
    availability: Optional[dict] = None
    contact_preferences: Optional[dict] = None

    class Config:
        from_attributes = True


class JobCoachProfileCreate(JobCoachProfileBase):
    """Payload for creating a job coach profile"""
    pass


class JobCoachProfileUpdate(JobCoachProfileBase):
    """Payload for updating a job coach profile"""
    pass


class JobCoachProfileResponse(JobCoachProfileBase):
    id: int
    coach_email: str
    profile_completion: int
    created_at: datetime
    updated_at: datetime
