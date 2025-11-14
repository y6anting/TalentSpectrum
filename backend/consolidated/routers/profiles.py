from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import Annotated
import os
import shutil
import json
import re
from datetime import datetime

from database.connection import get_db
from database.models.candidate import CandidateProfile, CandidateProfileRequest, Education, Experience, JobApplication, SavedJob

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_profiles(db: DbDep):
    return db.query(CandidateProfile).all()


@router.get("/{email}")
async def get_profiles_by_email(email: str, db: DbDep):
    try:
        # Get the candidate profile using email (pg_db style)
        profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
        
        if not profile:
            # Return empty profile structure instead of 404
            return {"message": "Profile not found", "email": email}
    except Exception as e:
        print(f"Error in get_profiles_by_email: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # Get related education records using email
    educations = db.query(Education).filter(Education.candidate_email == email).all()
    
    # Get related experience records using email
    experiences = db.query(Experience).filter(Experience.candidate_email == email).all()
    
    # Extract profile picture URL from personal_identifiers
    personal_identifiers = profile.personal_identifiers or {}
    if not isinstance(personal_identifiers, dict):
        personal_identifiers = {}
    profile_picture_url = personal_identifiers.get("profile_picture_url")
    
    # Convert to dictionaries for JSON response
    profile_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": profile.name,
        "email": profile.candidate_email,  # Use candidate_email field
        "location": profile.location,
        "profile_completion": profile.profile_completion,
        "accommodations": profile.accommodations,
        "preferences": profile.preferences,
        "personal_identifiers": profile.personal_identifiers,
        "profile_picture_url": profile_picture_url,  # Add profile picture URL
        "education": profile.education,
        "experience": profile.experience,
        "skills": profile.skills,
        "environment": profile.environment,
        "language_proficiencies": profile.language_proficiencies,
        "neurodivergent_strengths": profile.neurodivergent_strengths,
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
                "title": exp.title or '',
                "industry": exp.industry,
                "start": exp.start_date,
                "end": exp.end_date,
                "isCurrent": exp.end_date is None or exp.end_date == '',
                "seniorityLevel": exp.seniority_level,
                "skillsToolsUsed": exp.skills_tools_used,
                "projectHighlights": exp.project_highlights,
                "achievements": exp.achievements or '',
                "created_at": exp.created_at
            }
            for exp in experiences
        ]
    }
    
    return profile_dict

@router.post("/")
async def create_profile(db: DbDep, profile: CandidateProfileRequest):
    # Determine the email to use (could be email or candidate_email from resume extractor)
    user_email = profile.email or profile.candidate_email
    if not user_email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # If a profile with this email exists, update it instead of creating a duplicate
    existing = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == user_email).first()
    if existing:
        return await update_profile(db, user_email, profile)

    # Create the main profile
    profile_data = profile.model_dump(exclude_unset=True, exclude_none=True)
    
    # Remove fields that shouldn't be in the profile table
    educations_data = profile_data.pop('educations', [])
    experiences_data = profile_data.pop('experiences', [])
    profile_data.pop('email', None)
    profile_data.pop('candidate_email', None)
    profile_data.pop('applications', None)
    profile_data.pop('saved_jobs', None)
    profile_data.pop('dateOfBirth', None)
    
    new_profile = CandidateProfile(candidate_email=user_email, **profile_data)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    # Create education records
    print(f"Saving {len(educations_data)} education entries to database...")
    if educations_data:
        for i, edu_data in enumerate(educations_data):
            education = Education(
                candidate_email=user_email,
                level=edu_data.get('level'),
                field_of_study=edu_data.get('fieldOfStudy') or edu_data.get('field_of_study'),
                institution=edu_data.get('institution'),
                graduation_year=edu_data.get('graduationYear') or edu_data.get('graduation_year'),
                cgpa_grade=edu_data.get('cgpa_grade'),
                award=edu_data.get('award')
            )
            db.add(education)
    
    # Create experience records
    print(f"Saving {len(experiences_data)} experience entries to database...")
    if experiences_data:
        for i, exp_data in enumerate(experiences_data):
            experience = Experience(
                candidate_email=user_email,
                employer=exp_data.get('employer'),
                title=exp_data.get('title') or exp_data.get('Title'),
                industry=exp_data.get('industry'),
                start_date=exp_data.get('start') or exp_data.get('start_date'),
                end_date=exp_data.get('end') or exp_data.get('end_date'),
                seniority_level=exp_data.get('seniorityLevel') or exp_data.get('SeniorityLevel') or exp_data.get('seniority_level'),
                skills_tools_used=exp_data.get('skillsToolsUsed') or exp_data.get('SkillsToolsUsed') or exp_data.get('skills_tools_used'),
                project_highlights=exp_data.get('projectHighlights') or exp_data.get('ProjectHighlights') or exp_data.get('project_highlights'),
                achievements=exp_data.get('achievements') or exp_data.get('Achievements')
            )
            db.add(experience)
            print(f"   Experience {i+1}: {exp_data.get('title') or exp_data.get('Title')} at {exp_data.get('employer')}")
    else:
        print("⚠️ No experience data to save")
    
    db.commit()
    print(f"✅ Profile saved successfully with {len(educations_data)} educations and {len(experiences_data)} experiences")
    return {"message": "Profile added", "profile": new_profile}

@router.put("/{email}")
async def update_profile(db: DbDep, email: str, profile: CandidateProfileRequest):
    existing = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get the dict and exclude unset/None values
    profile_data = profile.model_dump(exclude_unset=True, exclude_none=True)
    
    # Handle email/candidate_email field mapping
    if 'candidate_email' in profile_data and 'email' not in profile_data:
        profile_data['email'] = profile_data['candidate_email']
    
    # Fields to ignore during update
    ignore_fields = ['email', 'candidate_email', 'educations', 'experiences', 'applications', 'saved_jobs', 'dateOfBirth']
    
    # Update profile fields
    for key, value in profile_data.items():
        if key not in ignore_fields and hasattr(existing, key):
            setattr(existing, key, value)
    
    # Handle educations if provided
    educations_data = profile_data.pop('educations', [])
    print(f"Updating profile: {len(educations_data)} education entries...")
    if educations_data:
        # Clear existing and add new ones
        deleted_count = db.query(Education).filter(Education.candidate_email == email).delete()
        print(f"   Deleted {deleted_count} existing education records")
        for i, edu_data in enumerate(educations_data):
            education = Education(
                candidate_email=email,
                level=edu_data.get('level'),
                field_of_study=edu_data.get('fieldOfStudy') or edu_data.get('field_of_study'),
                institution=edu_data.get('institution'),
                graduation_year=edu_data.get('graduationYear') or edu_data.get('graduation_year'),
                cgpa_grade=edu_data.get('cgpa_grade'),
                award=edu_data.get('award')
            )
            db.add(education)
            print(f"   Added education {i+1}: {edu_data.get('level')} in {edu_data.get('fieldOfStudy') or edu_data.get('field_of_study')}")
    else:
        print("No education data provided in update")
    
    # Handle experiences if provided
    experiences_data = profile_data.pop('experiences', [])
    print(f"💼 Updating profile: {len(experiences_data)} experience entries...")
    if experiences_data:
        # Clear existing and add new ones
        deleted_count = db.query(Experience).filter(Experience.candidate_email == email).delete()
        print(f"   Deleted {deleted_count} existing experience records")
        for i, exp_data in enumerate(experiences_data):
            experience = Experience(
                candidate_email=email,
                employer=exp_data.get('employer'),
                title=exp_data.get('title') or exp_data.get('Title'),
                industry=exp_data.get('industry'),
                start_date=exp_data.get('start') or exp_data.get('start_date'),
                end_date=exp_data.get('end') or exp_data.get('end_date'),
                seniority_level=exp_data.get('seniorityLevel') or exp_data.get('SeniorityLevel') or exp_data.get('seniority_level'),
                skills_tools_used=exp_data.get('skillsToolsUsed') or exp_data.get('SkillsToolsUsed') or exp_data.get('skills_tools_used'),
                project_highlights=exp_data.get('projectHighlights') or exp_data.get('ProjectHighlights') or exp_data.get('project_highlights'),
                achievements=exp_data.get('achievements') or exp_data.get('Achievements')
            )
            db.add(experience)
            print(f"   Added experience {i+1}: {exp_data.get('title') or exp_data.get('Title')} at {exp_data.get('employer')}")
    else:
        print("⚠️ No experience data provided in update")
    
    db.commit()
    db.refresh(existing)
    print(f"✅ Profile updated successfully with {len(educations_data)} educations and {len(experiences_data)} experiences")
    return {"message": "Profile updated", "profile": existing}

# Education endpoints
@router.patch("/{email}/education")
async def update_education(email: str, education_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name="",
            location="",
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers={},
            education={},
            experience={},
            skills={},
            environment={},
            language_proficiencies=[],
            neurodivergent_strengths=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Clear existing education records
    db.query(Education).filter(Education.candidate_email == email).delete()
    
    # Add new education records
    for edu in education_data.get("educations", []):
        new_education = Education(
            candidate_email=email,
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
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name="",
            location="",
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers={},
            education={},
            experience={},
            skills={},
            environment={},
            language_proficiencies=[],
            neurodivergent_strengths=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Clear existing experience records
    db.query(Experience).filter(Experience.candidate_email == email).delete()
    
    # Add new experience records
    for exp in experience_data.get("experiences", []):
        new_experience = Experience(
            candidate_email=email,
            employer=exp.get("employer"),
            title=exp.get("title"),
            industry=exp.get("industry"),
            start_date=exp.get("start"),
            end_date=exp.get("end"),
            seniority_level=exp.get("seniorityLevel"),
            skills_tools_used=exp.get("skillsToolsUsed"),
            project_highlights=exp.get("projectHighlights"),
            achievements=exp.get("achievements")
        )
        db.add(new_experience)
    
    db.commit()
    return {"message": "Experience updated successfully"}

# Personal identifiers endpoint
@router.patch("/{email}/personal_identifiers")
async def update_personal_identifiers(email: str, profile_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name=profile_data.get("name", ""),
            location=profile_data.get("location", ""),
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers=profile_data.get("personal_identifiers", {}),
            education={},
            experience={},
            skills={},
            environment={},
            language_proficiencies=[],
            neurodivergent_strengths=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Update the profile fields
    if "personal_identifiers" in profile_data:
        profile.personal_identifiers = profile_data["personal_identifiers"]
    if "name" in profile_data:
        profile.name = profile_data["name"]
    if "location" in profile_data:
        profile.location = profile_data["location"]
    
    db.commit()
    return {"message": "Personal information updated successfully"}

# Environment endpoint
@router.patch("/{email}/environment")
async def update_environment(email: str, env_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name="",
            location="",
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers={},
            education={},
            experience={},
            skills={},
            environment=env_data.get("environment", {}),
            language_proficiencies=[],
            neurodivergent_strengths=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    if "environment" in env_data:
        profile.environment = env_data["environment"]
    
    db.commit()
    return {"message": "Environment & preferences updated successfully"}

# Skills endpoint
@router.patch("/{email}/exp_skill")
async def update_exp_skill(email: str, skills_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name="",
            location="",
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers={},
            education={},
            experience={},
            skills=skills_data.get("exp_skill", {}),
            environment={},
            language_proficiencies=[],
            neurodivergent_strengths=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    if "exp_skill" in skills_data:
        # Update the skills field in the profile
        profile.skills = skills_data["exp_skill"]
    
    db.commit()
    return {"message": "Skills updated successfully"}

# Language proficiencies endpoint
@router.patch("/{email}/language_proficiencies")
async def update_language_proficiencies(email: str, lang_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name="",
            location="",
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers={},
            education={},
            experience={},
            skills={},
            environment={},
            language_proficiencies=lang_data.get("language_proficiencies", []),
            neurodivergent_strengths=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    if "language_proficiencies" in lang_data:
        profile.language_proficiencies = lang_data["language_proficiencies"]
    
    db.commit()
    return {"message": "Language proficiencies updated successfully"}

# Neurodivergent strengths endpoint
@router.patch("/{email}/neurodivergent_strengths")
async def update_neurodivergent_strengths(email: str, strengths_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    
    # Auto-create profile if it doesn't exist
    if not profile:
        profile = CandidateProfile(
            candidate_email=email,
            name="",
            location="",
            profile_completion=0,
            accommodations=[],
            preferences={},
            personal_identifiers={},
            education={},
            experience={},
            skills={},
            environment={},
            language_proficiencies=[],
            neurodivergent_strengths=strengths_data.get("neurodivergent_strengths", [])
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    if "neurodivergent_strengths" in strengths_data:
        profile.neurodivergent_strengths = strengths_data["neurodivergent_strengths"]
    
    db.commit()
    return {"message": "Neurodivergent strengths updated successfully"}

# Applications endpoints
@router.get("/{email}/applications")
async def get_applications(email: str, db: Session = Depends(get_db)):
    """Get all job applications for a candidate by email"""
    applications = db.query(JobApplication).filter(JobApplication.candidate_email == email).all()
    
    result = []
    for app in applications:
        app_data = {
            "id": str(app.id),
            "jobTitle": app.job_title,
            "company": app.company,
            "appliedDate": app.applied_date.strftime("%Y-%m-%d") if app.applied_date else None,
            "status": app.status,
            "location": app.location,
            "salary": app.salary,
            "accommodationsRequested": app.accommodations_requested,
            "score": app.score,
            "interviewDate": app.interview_date.strftime("%Y-%m-%d") if app.interview_date else None,
            "job_id": app.job_id if hasattr(app, 'job_id') else None,
        }
        result.append(app_data)
    
    return result

@router.get("/{email}/saved-jobs")
async def get_saved_jobs(email: str, db: Session = Depends(get_db)):
    """Get all saved jobs for a candidate by email"""
    saved_jobs = db.query(SavedJob).filter(SavedJob.candidate_email == email).all()
    
    result = []
    for job in saved_jobs:
        job_data = {
            "id": str(job.id),
            "title": job.job_title,
            "company": job.company,
            "location": job.location,
            "type": job.job_type,
            "salary": job.salary,
            "isInclusive": job.is_inclusive,
            "hasAccommodations": job.has_accommodations,
            "job_id": job.job_id if hasattr(job, 'job_id') else None,
        }
        result.append(job_data)
    
    return result

# =============================
#   PROFILE PICTURE UPLOAD ROUTE
# =============================

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to remove invalid characters"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing spaces and dots
    filename = filename.strip(' .')
    return filename

@router.post("/{email}/upload-profile-picture")
async def upload_profile_picture(email: str, db: DbDep, file: UploadFile = File(...)):
    """Upload profile picture for a candidate"""
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found for this email.")

    allowed_extensions = ["jpg", "jpeg", "png", "gif", "svg"]
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")

    # Use candidate name or email for filename
    sanitized_name = sanitize_filename(profile.name or email.split('@')[0])
    timestamp = int(datetime.now().timestamp())
    new_filename = f"{sanitized_name}_{timestamp}.{file_extension}"
    
    # Profile pictures directory - match jobs.py path calculation exactly
    # From routers/profiles.py, go up 2 levels to backend/, then to talent-spectrum-app
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Goes to routers/
    PROFILE_PICTURES_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "talent-spectrum-app", "public", "profile-pictures"))
    file_path = os.path.join(PROFILE_PICTURES_DIR, new_filename)

    try:
        os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)
        print(f"Saving profile picture to: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    profile_picture_url = f"/profile-pictures/{new_filename}"
    
    # Store in personal_identifiers JSON field
    personal_identifiers = profile.personal_identifiers or {}
    if not isinstance(personal_identifiers, dict):
        personal_identifiers = {}
    personal_identifiers["profile_picture_url"] = profile_picture_url
    profile.personal_identifiers = personal_identifiers
    
    db.commit()
    db.refresh(profile)

    return JSONResponse(status_code=200, content={"message": "Profile picture uploaded successfully", "profile_picture_url": profile_picture_url})

