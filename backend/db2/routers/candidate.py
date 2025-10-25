from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from database.connection import get_db
from database.models.candidate import Candidate_Profile
from models.candidate import CandidateProfileRequest
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json

router = APIRouter(prefix="/profiles", tags=["Profiles"])  

DbDep = Annotated[Session, Depends(get_db)]

# Pydantic models for partial updates
class PersonalIdentifiers(BaseModel):
    fullName: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    emailAddress: Optional[str] = None
    phoneNumber: Optional[str] = None
    residentialAddress: Optional[str] = None
    nric: Optional[str] = None
    oku_card: Optional[str] = None
    linkedin: Optional[str] = None

class Education(BaseModel):
    id: int
    level: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    institution: Optional[str] = None
    graduationYear: Optional[int] = None
    cgpa_grade: Optional[str] = None
    award: Optional[str] = None

class Experience(BaseModel):
    id: int
    employer: Optional[str] = None
    industry: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    seniorityLevel: Optional[str] = None
    skillsToolsUsed: Optional[str] = None
    projectHighlights: Optional[str] = None

class ExpSkill(BaseModel):
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

class Environment(BaseModel):
    patternRecognition: Optional[str] = None
    attention: Optional[str] = None
    systematicThinking: Optional[str] = None
    bigVsDetail: Optional[str] = None
    taskSwitching: Optional[str] = None
    hyperfocus: Optional[str] = None
    communicationMedium: Optional[str] = None
    clarity: Optional[str] = None
    teamStyle: Optional[str] = None
    presentationComfort: Optional[str] = None
    checkIns: Optional[str] = None
    jobCoach: Optional[str] = None
    auditory: Optional[str] = None
    visual: Optional[str] = None
    workspace: Optional[str] = None
    workdayStructure: Optional[str] = None

class JobPreferences(BaseModel):
    preferredIndustries: Optional[List[str]] = None
    preferredRoles: Optional[List[str]] = None
    locationPreference: Optional[str] = None
    availability: Optional[str] = None

class PersonalIdentifiersUpdate(BaseModel):
    personal_identifiers: Optional[PersonalIdentifiers] = None
    name: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None

class EducationUpdate(BaseModel):
    educations: List[Education]

class ExpSkillUpdate(BaseModel):
    experiences: List[Experience]
    exp_skill: Optional[ExpSkill] = None

class EnvironmentUpdate(BaseModel):
    environment: Optional[Environment] = None
    jobPreferences: Optional[JobPreferences] = None

def calculate_profile_completion(profile: Candidate_Profile) -> int:
    completed_fields = 0
    total_fields = 0

    # personal_identifiers
    personal_identifiers = profile.personal_identifiers or {}
    completed_fields += sum(1 for value in personal_identifiers.values() if value)
    total_fields += len(personal_identifiers)

    # educations
    educations = profile.educations or []
    for edu in educations:
        completed_fields += sum(1 for value in edu.values() if value is not None)
        total_fields += len(edu)

    # experiences
    experiences = profile.experiences or []
    for exp in experiences:
        completed_fields += sum(1 for value in exp.values() if value is not None)
        total_fields += len(exp)

    # exp_skill
    exp_skill = profile.exp_skill or {}
    completed_fields += sum(1 for value in exp_skill.values() if value)
    total_fields += len(exp_skill)

    # environment
    environment = profile.environment or {}
    completed_fields += sum(1 for value in environment.values() if value)
    total_fields += len(environment)

    # job_preferences
    job_preferences = profile.job_preferences or {}
    for key, value in job_preferences.items():
        if isinstance(value, list):
            completed_fields += 1 if value else 0
            total_fields += 1
        else:
            completed_fields += 1 if value else 0
            total_fields += 1

    return round((completed_fields / total_fields) * 100) if total_fields > 0 else 0

@router.get("/{email}")
async def get_candidate_by_email(email: str, db: DbDep):
    profile = db.query(Candidate_Profile).filter(Candidate_Profile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/")
async def create_candidate(db: DbDep, candidate: CandidateProfileRequest):
    try:
        new_candidate = Candidate_Profile(**candidate.dict(exclude_unset=True))
        new_candidate.profile_completion = calculate_profile_completion(new_candidate)
        db.add(new_candidate)
        db.commit()
        db.refresh(new_candidate)
        return {"message": "Candidate added", "candidate": new_candidate}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating candidate: {e}")

@router.patch("/{email}/personal_identifiers")
async def update_personal_identifiers(email: str, update: PersonalIdentifiersUpdate, db: DbDep):
    try:
        profile = db.query(Candidate_Profile).filter(Candidate_Profile.email == email).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Update only provided fields
        if update.personal_identifiers:
            current_personal_identifiers = profile.personal_identifiers or {}
            new_personal_identifiers = update.personal_identifiers.dict(exclude_unset=True)
            profile.personal_identifiers = {**current_personal_identifiers, **new_personal_identifiers}
        if update.name is not None:
            profile.name = update.name
        if update.email is not None:
            profile.email = update.email
        if update.location is not None:
            profile.location = update.location

        # Recalculate profile completion
        profile.profile_completion = calculate_profile_completion(profile)

        db.commit()
        db.refresh(profile)
        return {"message": "Personal information updated", "candidate": profile}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating personal information: {e}")

@router.patch("/{email}/education")
async def update_education(email: str, update: EducationUpdate, db: DbDep):
    try:
        profile = db.query(Candidate_Profile).filter(Candidate_Profile.email == email).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Update educations
        profile.educations = [edu.dict(exclude_unset=True) for edu in update.educations]

        # Recalculate profile completion
        profile.profile_completion = calculate_profile_completion(profile)

        db.commit()
        db.refresh(profile)
        return {"message": "Education updated", "candidate": profile}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating education: {e}")

@router.patch("/{email}/exp_skill")
async def update_exp_skill(email: str, update: ExpSkillUpdate, db: DbDep):
    try:
        profile = db.query(Candidate_Profile).filter(Candidate_Profile.email == email).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Update experiences and exp_skill
        profile.experiences = [exp.dict(exclude_unset=True) for exp in update.experiences]
        if update.exp_skill:
            current_exp_skill = profile.exp_skill or {}
            profile.exp_skill = {**current_exp_skill, **update.exp_skill.dict(exclude_unset=True)}

        # Recalculate profile completion
        profile.profile_completion = calculate_profile_completion(profile)

        db.commit()
        db.refresh(profile)
        return {"message": "Experience & Skills updated", "candidate": profile}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating experience & skills: {e}")

@router.patch("/{email}/environment")
async def update_environment(email: str, update: EnvironmentUpdate, db: DbDep):
    try:
        profile = db.query(Candidate_Profile).filter(Candidate_Profile.email == email).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Update environment and job_preferences
        if update.environment:
            current_environment = profile.environment or {}
            profile.environment = {**current_environment, **update.environment.dict(exclude_unset=True)}
        if update.jobPreferences:
            current_job_preferences = profile.job_preferences or {}
            profile.job_preferences = {**current_job_preferences, **update.jobPreferences.dict(exclude_unset=True)}

        # Recalculate profile completion
        profile.profile_completion = calculate_profile_completion(profile)

        db.commit()
        db.refresh(profile)
        return {"message": "Environment & Preferences updated", "candidate": profile}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating environment & preferences: {e}")

@router.delete("/{email}")
async def delete_candidate(email: str, db: DbDep):
    try:
        profile = db.query(Candidate_Profile).filter(Candidate_Profile.email == email).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        db.delete(profile)
        db.commit()
        return {"message": "Profile deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting profile: {e}")
