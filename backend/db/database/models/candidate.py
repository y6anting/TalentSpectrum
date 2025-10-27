from database.connection import Base
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# SQLAlchemy models
class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)  # For API/session
    name = Column(String)  # For display in Header
    role = Column(String)  # CANDIDATE, EMPLOYER, JOB_COACH
    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False)

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    name = Column(String)
    email = Column(String)
    location = Column(String)
    profile_completion = Column(Integer, default=0)
    accommodations = Column(JSON)  # List of accommodation strings
    preferences = Column(JSON)    # Work type, communication, schedule preferences
    personal_identifiers = Column(JSON)  # Full name, DOB, gender, etc.
    education = Column(JSON)       # Education details
    experience = Column(JSON)      # Work experience data
    skills = Column(JSON)          # Skills data (hard skills, soft skills)
    exp_skill = Column(JSON)       # Combined experience and skills data
    language_proficiencies = Column(JSON)  # Language proficiency data
    environment = Column(JSON)     # Environment preferences
    neurodivergent_strengths = Column(JSON)  # Neurodivergent strengths
    applications = Column(JSON)  # Applications
    saved_jobs = Column(JSON)  # Saved jobs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="candidate_profile")
    

class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    level = Column(String)
    field_of_study = Column(String)
    institution = Column(String)
    graduation_year = Column(Integer)
    cgpa_grade = Column(String)
    award = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    candidate = relationship("CandidateProfile", back_populates="educations")

class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    employer = Column(String)
    title = Column(String)  # Added title field
    industry = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    seniority_level = Column(String)
    skills_tools_used = Column(String)
    project_highlights = Column(Text)
    achievements = Column(Text)  # Added achievements field
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    candidate = relationship("CandidateProfile", back_populates="experiences")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    job_title = Column(String)
    company = Column(String)
    applied_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String)  # under_review, interview_scheduled, rejected, accepted
    location = Column(String)
    salary = Column(String)
    accommodations_requested = Column(Boolean, default=False)
    score = Column(Integer)
    interview_date = Column(DateTime, nullable=True)

    # Relationship
    candidate = relationship("CandidateProfile", back_populates="applications")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    job_title = Column(String)
    company = Column(String)
    location = Column(String)
    job_type = Column(String)
    salary = Column(String)
    is_inclusive = Column(Boolean, default=False)
    has_accommodations = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    candidate = relationship("CandidateProfile", back_populates="saved_jobs")

# Update User model to include relationship
User.candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False)
CandidateProfile.educations = relationship("Education", back_populates="candidate")
CandidateProfile.experiences = relationship("Experience", back_populates="candidate")
CandidateProfile.applications = relationship("JobApplication", back_populates="candidate")
CandidateProfile.saved_jobs = relationship("SavedJob", back_populates="candidate")

# Pydantic schemas for API requests and responses
class UserRequest(BaseModel):
    username: str
    role: str

    class Config:
        from_attributes = True

class PersonalIdentifiers(BaseModel):
    fullName: str
    nric: Optional[str] = None
    emailAddress: str
    phoneNumber: str
    dateOfBirth: str
    gender: str
    nationality: str
    oku_card: Optional[str] = None
    preferred_role: str
    preferred_industry: str
    preferred_location: str

class Preferences(BaseModel):
    workType: Optional[str] = None
    communication: Optional[str] = None
    schedule: Optional[str] = None

class JobPreferences(BaseModel):
    preferredIndustries: List[str] = []
    preferredRoles: List[str] = []
    locationPreference: Optional[str] = None
    availability: Optional[str] = None

class EducationData(BaseModel):
    level: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    institution: Optional[str] = None
    graduationYear: Optional[int] = None
    cgpa: Optional[float] = None
    grade: Optional[str] = None
    award: Optional[str] = None

class ExperienceSkills(BaseModel):
    employer: Optional[str] = None
    industry: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    RoleTitle: Optional[str] = None
    YearsInRole: Optional[str] = None
    SeniorityLevel: Optional[str] = None
    SkillsToolsUsed: Optional[str] = None
    ProjectHighlights: Optional[str] = None
    HardSkills: Optional[str] = None
    SoftSkills: Optional[str] = None
    LanguageProficiency: Optional[str] = None
    TechnicalKeywords: Optional[str] = None
    Achievements: Optional[str] = None

class LanguageProficiency(BaseModel):
    id: Optional[int] = None
    language: str
    reading: str
    writing: str
    listening: str
    speaking: str

class NeurodivergentStrengths(BaseModel):
    strengths: List[str] = []

class Environment(BaseModel):
    # Cognitive & Technical
    patternRecognition: Optional[str] = None
    attention: Optional[str] = None
    systematicThinking: Optional[str] = None
    bigVsDetail: Optional[str] = None
    taskSwitching: Optional[str] = None
    hyperfocus: Optional[str] = None
    # Communication & Social
    communicationMedium: Optional[str] = None
    clarity: Optional[str] = None
    teamStyle: Optional[str] = None
    presentationComfort: Optional[str] = None
    checkIns: Optional[str] = None
    jobCoach: Optional[str] = None
    # Environmental & Sensory
    auditory: Optional[str] = None
    visual: Optional[str] = None
    workspace: Optional[str] = None
    workdayStructure: Optional[str] = None

class EducationRequest(BaseModel):
    level: Optional[str] = None
    field_of_study: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa_grade: Optional[str] = None
    award: Optional[str] = None

    class Config:
        from_attributes = True

class ExperienceRequest(BaseModel):
    employer: Optional[str] = None
    industry: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    seniority_level: Optional[str] = None
    skills_tools_used: Optional[str] = None
    project_highlights: Optional[str] = None
    title: Optional[str] = None
    is_current: Optional[bool] = None
    achievements: Optional[str] = None

    class Config:
        from_attributes = True

class CandidateProfileRequest(BaseModel):
    name: str
    email: str
    location: Optional[str] = None
    profile_completion: int = 0
    accommodations: List[str] = []
    preferences: Optional[Preferences] = None
    personal_identifiers: Optional[PersonalIdentifiers] = None
    education: Optional[EducationData] = None
    experience: Optional[ExperienceSkills] = None
    skills: Optional[ExperienceSkills] = None
    environment: Optional[Environment] = None
    language_proficiencies: Optional[List[LanguageProficiency]] = None
    neurodivergent_strengths: Optional[List[str]] = None
    educations: Optional[List[EducationRequest]] = None
    experiences: Optional[List[ExperienceRequest]] = None

    class Config:
        from_attributes = True

class JobApplicationRequest(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    salary: Optional[str] = None
    accommodations_requested: bool = False
    score: Optional[int] = None
    interview_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class SavedJobRequest(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[str] = None
    is_inclusive: bool = False
    has_accommodations: bool = False

    class Config:
        from_attributes = True

# Response models
class CandidateProfileResponse(CandidateProfileRequest):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EducationResponse(EducationRequest):
    id: int
    candidate_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExperienceResponse(ExperienceRequest):
    id: int
    candidate_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class JobApplicationResponse(JobApplicationRequest):
    id: int
    candidate_id: int
    applied_date: datetime
    status: str

    class Config:
        from_attributes = True

class SavedJobResponse(SavedJobRequest):
    id: int
    candidate_id: int
    created_at: datetime

    class Config:
        from_attributes = True
