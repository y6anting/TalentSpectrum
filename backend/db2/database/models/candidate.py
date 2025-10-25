# database/models/candidate.py
from database.connection import Base
from sqlalchemy import Column, Integer, String, Boolean, Text, Float
from pydantic import BaseModel
from typing import Optional

class Candidate_Profile(Base):
    __tablename__ = "candidate_profile"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    location = Column(String)
    about_me = Column(Text)

    # Education
    highest_education = Column(String)
    university = Column(String)
    field_of_study = Column(String)
    graduation_year = Column(String)

    # Work Experience
    years_of_experience = Column(Float)
    last_job_title = Column(String)
    last_company = Column(String)
    work_mode_preference = Column(String)

    # Skills
    technical_skills = Column(Text)
    soft_skills = Column(Text)

    # Environment & Preferences
    sensory_friendly_environment = Column(Boolean, default=False)
    flexible_work_hour = Column(Boolean, default=False)
    peer_support_system = Column(Boolean, default=False)
    mental_health_support = Column(Boolean, default=False)
    quiet_room = Column(Boolean, default=False)
    dedicated_workspace = Column(Boolean, default=False)
    near_public_transport = Column(Boolean, default=False)


# Pydantic schema
class CandidateProfileRequest(BaseModel):
    name: str
    email: str
    phone: str
    location: Optional[str] = None
    about_me: Optional[str] = None
    highest_education: Optional[str] = None
    university: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    years_of_experience: Optional[float] = None
    last_job_title: Optional[str] = None
    last_company: Optional[str] = None
    work_mode_preference: Optional[str] = None
    technical_skills: Optional[str] = None
    soft_skills: Optional[str] = None
    sensory_friendly_environment: bool = False
    flexible_work_hour: bool = False
    peer_support_system: bool = False
    mental_health_support: bool = False
    quiet_room: bool = False
    dedicated_workspace: bool = False
    near_public_transport: bool = False

    class Config:
        from_attributes = True


# from database.connection import Base
# from pydantic import BaseModel, EmailStr
# from typing import Optional, Dict, Any
# from sqlalchemy import Column, Integer, String, Text, Boolean, JSON


# # ---------------- SQLAlchemy Model ---------------- #
# class Candidate(Base):
#     __tablename__ = "candidate"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String)
#     email = Column(String, unique=True, index=True)
#     location = Column(String)
#     profile_completion = Column(Integer, default=0)
#     accommodations = Column(Text)
#     work_type = Column(String)
#     communication = Column(String)
#     schedule = Column(String)

#     # JSON fields for structured data
#     personal_identifiers = Column(JSON, nullable=True)
#     job_preferences = Column(JSON, nullable=True)
#     education = Column(JSON, nullable=True)
#     exp_skill = Column(JSON, nullable=True)
#     environment = Column(JSON, nullable=True)

#     # Accessibility & Support
#     flexible_work_hour = Column(Boolean, default=False)
#     sensory_friendly_environment = Column(Boolean, default=False)
#     peer_support_system = Column(Boolean, default=False)
#     dedicated_workspace = Column(Boolean, default=False)
#     neurodiversity_awareness_training = Column(Boolean, default=False)
#     regular_supervisor_check_in = Column(Boolean, default=False)
#     zero_tolerance_bullying_mobbing_policy = Column(Boolean, default=False)
#     augmentative_alternative_communication = Column(Boolean, default=False)
#     quiet_room = Column(Boolean, default=False)
#     sensory_aids = Column(Boolean, default=False)
#     provide_visual_guidance = Column(Boolean, default=False)
#     uses_project_management_tools = Column(Boolean, default=False)
#     optional_social_event = Column(Boolean, default=False)
#     mental_health_support = Column(Boolean, default=False)
#     near_public_transport = Column(Boolean, default=False)


# # ---------------- Pydantic Schema ---------------- #
# class CandidateRequest(BaseModel):
#     name: Optional[str]
#     email: Optional[EmailStr]
#     location: Optional[str]
#     profile_completion: Optional[int] = 0
#     accommodations: Optional[str] = None
#     work_type: Optional[str] = None
#     communication: Optional[str] = None
#     schedule: Optional[str] = None

#     personal_identifiers: Optional[Dict[str, Any]] = None
#     job_preferences: Optional[Dict[str, Any]] = None
#     education: Optional[Dict[str, Any]] = None
#     exp_skill: Optional[Dict[str, Any]] = None
#     environment: Optional[Dict[str, Any]] = None

#     flexible_work_hour: Optional[bool] = False
#     sensory_friendly_environment: Optional[bool] = False
#     peer_support_system: Optional[bool] = False
#     dedicated_workspace: Optional[bool] = False
#     neurodiversity_awareness_training: Optional[bool] = False
#     regular_supervisor_check_in: Optional[bool] = False
#     zero_tolerance_bullying_mobbing_policy: Optional[bool] = False
#     augmentative_alternative_communication: Optional[bool] = False
#     quiet_room: Optional[bool] = False
#     sensory_aids: Optional[bool] = False
#     provide_visual_guidance: Optional[bool] = False
#     uses_project_management_tools: Optional[bool] = False
#     optional_social_event: Optional[bool] = False
#     mental_health_support: Optional[bool] = False
#     near_public_transport: Optional[bool] = False

#     class Config:
#         from_attributes = True
