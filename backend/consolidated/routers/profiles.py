from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import Annotated

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
    profile_data = profile.dict(exclude_unset=True, exclude_none=True)
    
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
    if educations_data:
        for edu_data in educations_data:
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
    if experiences_data:
        for exp_data in experiences_data:
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
    
    db.commit()
    return {"message": "Profile added", "profile": new_profile}

@router.put("/{email}")
async def update_profile(db: DbDep, email: str, profile: CandidateProfileRequest):
    existing = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get the dict and exclude unset/None values
    profile_data = profile.dict(exclude_unset=True, exclude_none=True)
    
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
    if 'educations' in profile_data and profile_data['educations']:
        # Clear existing and add new ones
        db.query(Education).filter(Education.candidate_email == email).delete()
        for edu_data in profile_data['educations']:
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
    
    # Handle experiences if provided
    if 'experiences' in profile_data and profile_data['experiences']:
        # Clear existing and add new ones
        db.query(Experience).filter(Experience.candidate_email == email).delete()
        for exp_data in profile_data['experiences']:
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
    
    db.commit()
    db.refresh(existing)
    return {"message": "Profile updated", "profile": existing}

# Education endpoints
@router.patch("/{email}/education")
async def update_education(email: str, education_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
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
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
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
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
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
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if "environment" in env_data:
        profile.environment = env_data["environment"]
    
    db.commit()
    return {"message": "Environment & preferences updated successfully"}

# Language proficiencies endpoint
@router.patch("/{email}/language_proficiencies")
async def update_language_proficiencies(email: str, lang_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if "language_proficiencies" in lang_data:
        profile.language_proficiencies = lang_data["language_proficiencies"]
    
    db.commit()
    return {"message": "Language proficiencies updated successfully"}

# Neurodivergent strengths endpoint
@router.patch("/{email}/neurodivergent_strengths")
async def update_neurodivergent_strengths(email: str, strengths_data: dict, db: DbDep):
    profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if "neurodivergent_strengths" in strengths_data:
        profile.neurodivergent_strengths = strengths_data["neurodivergent_strengths"]
    
    db.commit()
    return {"message": "Neurodivergent strengths updated successfully"}

# Applications endpoints
@router.get("/{email}/applications")
async def get_applications(email: str, db: Session = Depends(get_db)):
    """Get all job applications for a candidate by email"""
    applications = db.query(JobApplication).filter(JobApplication.candidate_email == email).all()
    
    return [
        {
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
        }
        for app in applications
    ]

@router.get("/{email}/saved-jobs")
async def get_saved_jobs(email: str, db: Session = Depends(get_db)):
    """Get all saved jobs for a candidate by email"""
    saved_jobs = db.query(SavedJob).filter(SavedJob.candidate_email == email).all()
    
    return [
        {
            "id": str(job.id),
            "title": job.job_title,
            "company": job.company,
            "location": job.location,
            "type": job.job_type,
            "salary": job.salary,
            "isInclusive": job.is_inclusive,
            "hasAccommodations": job.has_accommodations,
        }
        for job in saved_jobs
    ]

