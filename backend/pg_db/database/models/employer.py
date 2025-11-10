# backend/pg_db/database/models/employer.py

from database.connection import Base
from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from pydantic import BaseModel # Keep BaseModel
from typing import Optional, List # <--- ADD List if not already there

# SQLAlchemy model
class Post_Job(Base):
    __tablename__ = "post_job"

    id = Column(Integer, primary_key = True, index = True)
    employer_email = Column(String, nullable=False)
    job_title = Column(String)
    job_type = Column(String)
    work_mode = Column(String)
    experience_level = Column(String)
    location = Column(String)
    salary_range = Column(Integer)
    job_summary = Column(Text, nullable=False)
    job_requirements = Column(Text)
    soft_skills = Column(Text)
    flexible_work_hour = Column(Boolean, default=False)
    sensory_friendly_environment = Column(Boolean, default=False)
    peer_support_system = Column(Boolean, default=False)
    dedicated_workspace = Column(Boolean, default=False)
    neurodiversity_awareness_training = Column(Boolean, default=False)
    regular_supervisor_check_in = Column(Boolean, default=False)
    zero_tolerance_bullying_mobbing_policy = Column(Boolean, default=False)
    augmentative_alternative_communication = Column(Boolean, default=False)
    quiet_room = Column(Boolean, default=False)
    sensory_aids = Column(Boolean, default=False)
    provide_visual_guidance = Column(Boolean, default=False)
    uses_project_management_tools = Column(Boolean, default=False)
    optional_social_event = Column(Boolean, default=False)
    mental_health_support = Column(Boolean, default=False)
    near_public_transport = Column(Boolean, default=False)

# Pydantic schema collocated with model
class PostJobRequest(BaseModel):
    employer_email: str
    job_title: str
    job_type: str
    work_mode: str
    experience_level: str
    location: str
    salary_range: int
    job_summary: str
    job_requirements: Optional[str] = None
    soft_skills: Optional[str] = None
    flexible_work_hour: bool = False
    sensory_friendly_environment: bool = False
    peer_support_system: bool = False
    dedicated_workspace: bool = False
    neurodiversity_awareness_training: bool = False
    regular_supervisor_check_in: bool = False
    zero_tolerance_bullying_mobbing_policy: bool = False
    augmentative_alternative_communication: bool = False
    quiet_room: bool = False
    sensory_aids: bool = False
    provide_visual_guidance: bool = False
    uses_project_management_tools: bool = False
    optional_social_event: bool = False
    mental_health_support: bool = False
    near_public_transport: bool = False

    class Config:
        from_attributes = True

# Company Profile Model
class Company(Base):
    __tablename__ = "company"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    location = Column(String)
    website = Column(String)
    employees = Column(String)
    size = Column(String)
    inclusion_score = Column(Integer, default=0)
    certifications = Column(Text)  # JSON string of certifications array
    description = Column(Text)
    founded_year = Column(Integer)
    company_type = Column(String)  # e.g., "Public", "Private", "Non-profit"
    logo_url = Column(String, nullable=True)

# Pydantic schema for Company
class CompanyRequest(BaseModel):
    email: str
    name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    employees: Optional[str] = None
    size: Optional[str] = None
    inclusion_score: Optional[int] = 0
    certifications: Optional[str] = None
    description: Optional[str] = None
    founded_year: Optional[int] = None
    company_type: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True

# NEW: Pydantic model for the combined Full Profile
class FullProfileResponse(BaseModel):
    # Fields from Post_Job
    job_id: int
    employer_email: str
    job_title: str
    job_type: str
    work_mode: str
    experience_level: str
    job_location: str # Renamed to avoid conflict with company_location
    salary_range: int
    job_summary: str
    job_requirements: Optional[str] = None
    soft_skills: Optional[str] = None
    flexible_work_hour: bool = False
    sensory_friendly_environment: bool = False
    peer_support_system: bool = False
    dedicated_workspace: bool = False
    neurodiversity_awareness_training: bool = False
    regular_supervisor_check_in: bool = False
    zero_tolerance_bullying_mobbing_policy: bool = False
    augmentative_alternative_communication: bool = False
    quiet_room: bool = False
    sensory_aids: bool = False
    provide_visual_guidance: bool = False
    uses_project_management_tools: bool = False
    optional_social_event: bool = False
    mental_health_support: bool = False
    near_public_transport: bool = False

    # Fields from Company
    company_id: int
    company_name: str
    company_industry: Optional[str] = None
    company_location: Optional[str] = None # Renamed to avoid conflict with job_location
    company_website: Optional[str] = None
    company_employees: Optional[str] = None
    company_size: Optional[str] = None
    company_inclusion_score: Optional[int] = 0
    company_certifications: Optional[str] = None
    company_description: Optional[str] = None
    company_founded_year: Optional[int] = None
    company_type: Optional[str] = None
    company_logo_url: Optional[str] = None

    class Config:
        from_attributes = True