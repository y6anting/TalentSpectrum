from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Annotated

from database.connection import get_db
from database.models.candidate import CandidateProfile, CandidateProfileRequest, Education, Experience

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_profiles(db: DbDep):
    return db.query(CandidateProfile).all()


@router.get("/{email}")
async def get_profiles_by_email(email: str, db: DbDep):
    # Get the candidate profile with related education and experience data
    profile = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get related education records
    educations = db.query(Education).filter(Education.candidate_id == profile.id).all()
    
    # Get related experience records  
    experiences = db.query(Experience).filter(Experience.candidate_id == profile.id).all()
    
    # Convert to dictionaries for JSON response
    profile_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": profile.name,
        "email": profile.email,
        "location": profile.location,
        "profile_completion": profile.profile_completion,
        "accommodations": profile.accommodations,
        "preferences": profile.preferences,
        "personal_identifiers": profile.personal_identifiers,
        "job_preferences": profile.job_preferences,
        "education": profile.education,
        "exp_skill": profile.exp_skill,
        "environment": profile.environment,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
        "educations": [
            {
                "id": edu.id,
                "level": edu.level,
                "fieldOfStudy": edu.field_of_study,
                "institution": edu.institution,
                "graduationYear": edu.graduation_year,
                "cgpa_grade": edu.cgpa_grade,
                "award": edu.award,
                "created_at": edu.created_at
            }
            for edu in educations
        ],
        "experiences": [
            {
                "id": exp.id,
                "employer": exp.employer,
                "industry": exp.industry,
                "start": exp.start_date,
                "end": exp.end_date,
                "seniorityLevel": exp.seniority_level,
                "skillsToolsUsed": exp.skills_tools_used,
                "projectHighlights": exp.project_highlights,
                "created_at": exp.created_at
            }
            for exp in experiences
        ]
    }
    
    return profile_dict

@router.post("/")
async def create_profile(db: DbDep, profile: CandidateProfileRequest):
    # If a profile with this email exists, update it instead of creating a duplicate
    existing = db.query(CandidateProfile).filter(CandidateProfile.email == profile.email).first()
    if existing:
        # Delegate to the update_profile endpoint logic to keep behavior consistent
        return await update_profile(db, profile.email, profile)

    new_profile = CandidateProfile(**profile.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return {"message": "Profile added", "profile": new_profile}

@router.put("/{email}")
async def update_profile(db: DbDep, email: str, profile: CandidateProfileRequest):
    existing = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in profile.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Profile updated", "profile": existing}

# Education endpoints
@router.patch("/{email}/education")
async def update_education(email: str, education_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Clear existing education records
    db.query(Education).filter(Education.candidate_id == profile.id).delete()
    
    # Add new education records
    for edu in education_data.get("educations", []):
        new_education = Education(
            candidate_id=profile.id,
            level=edu.get("level"),
            field_of_study=edu.get("fieldOfStudy"),
            institution=edu.get("institution"),
            graduation_year=edu.get("graduationYear"),
            cgpa_grade=edu.get("cgpa_grade"),
            award=edu.get("award")
        )
        db.add(new_education)
    
    db.commit()
    return {"message": "Education updated successfully"}

# Experience endpoints
@router.patch("/{email}/experience")
async def update_experience(email: str, experience_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Clear existing experience records
    db.query(Experience).filter(Experience.candidate_id == profile.id).delete()
    
    # Add new experience records
    for exp in experience_data.get("experiences", []):
        new_experience = Experience(
            candidate_id=profile.id,
            employer=exp.get("employer"),
            industry=exp.get("industry"),
            start_date=exp.get("start"),
            end_date=exp.get("end"),
            seniority_level=exp.get("seniorityLevel"),
            skills_tools_used=exp.get("skillsToolsUsed"),
            project_highlights=exp.get("projectHighlights")
        )
        db.add(new_experience)
    
    db.commit()
    return {"message": "Experience updated successfully"}

# Skills endpoint
@router.patch("/{email}/exp_skill")
async def update_exp_skill(email: str, skill_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update the exp_skill JSON field in the profile
    profile.exp_skill = skill_data.get("exp_skill", {})
    db.commit()
    return {"message": "Skills updated successfully"}

# Personal identifiers endpoint
@router.patch("/{email}/personal_identifiers")
async def update_personal_identifiers(email: str, profile_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update personal identifiers and basic profile info
    if "personal_identifiers" in profile_data:
        profile.personal_identifiers = profile_data["personal_identifiers"]
    if "name" in profile_data:
        profile.name = profile_data["name"]
    if "email" in profile_data:
        profile.email = profile_data["email"]
    if "location" in profile_data:
        profile.location = profile_data["location"]
    
    db.commit()
    return {"message": "Personal information updated successfully"}

# Environment endpoint
@router.patch("/{email}/environment")
async def update_environment(email: str, env_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update environment and job preferences
    if "environment" in env_data:
        profile.environment = env_data["environment"]
    if "jobPreferences" in env_data:
        profile.job_preferences = env_data["jobPreferences"]
    
    db.commit()
    return {"message": "Environment & preferences updated successfully"}

# @router.delete("/{profile_id}")
# async def delete_profile(db: DbDep, profile_id: int):
#     existing = db.query(CandidateProfile).filter(CandidateProfile.id == profile_id).first()
#     if not existing:
#         raise HTTPException(status_code=404, detail="Profile not found")
#     db.delete(existing)
#     db.commit()
#     return {"message": "Profile deleted"}