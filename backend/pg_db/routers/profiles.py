# backend/pg_db/routers/profiles.py

from fastapi import APIRouter, Depends, Request, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Annotated, Dict, Any, List, Optional
from datetime import datetime
import time
import threading

# Import database connection
from database.connection import get_db
# Import models
from database.models.candidate import CandidateProfile
from database.models.users import LoginUser, UserRole

# --- Global state for unique ID generation ---
_last_generated_id = 0
_id_lock = threading.Lock()

# Helper function to generate a unique 13-digit ID
def generate_13_digit_id() -> int:
    global _last_generated_id
    with _id_lock:
        current_time_ms = int(time.time() * 1000)
        new_id = max(current_time_ms, _last_generated_id + 1)
        _last_generated_id = new_id
        return new_id

router = APIRouter(tags=["Profiles"])

DbDep = Annotated[Session, Depends(get_db)]


# =========================================================
# 1️⃣ GET Candidate Profile by Email
# =========================================================
@router.get("/{email}")
async def get_candidate_profile(email: str, db: DbDep):
    try:
        profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
        if not profile:
            return {"message": "Profile not found"}
        return {k: v for k, v in profile.__dict__.items() if not k.startswith('_sa_instance_state')}
    except Exception as e:
        print(f"Error in get_candidate_profile: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# =========================================================
# 2️⃣ POST - Create Candidate Profile (email only if not exist)
# =========================================================
@router.post("/{email}")
async def create_candidate_profile(email: str, db: DbDep):
    try:
        existing = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
        if existing:
            return {"message": "Profile already exists", "id": existing.id}

        new_profile = CandidateProfile(
            candidate_email=email,
            name=None,
            location=None,
            profile_completion=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)

        return {"message": "Profile created successfully", "id": new_profile.id}
    except Exception as e:
        print(f"Error in create_candidate_profile: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# =========================================================
# 3️⃣ PATCH - Update Candidate Personal Identifiers
# =========================================================
@router.patch("/{email}/personal_identifiers")
async def update_personal_identifiers(email: str, request: dict, db: DbDep):
    try:
        email = email.strip().lower()
        profile = (
            db.query(CandidateProfile)
            .filter(CandidateProfile.candidate_email == email)
            .first()
        )

        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        profile.personal_identifiers = request.get("personal_identifiers", {})
        profile.name = request.get("name")
        profile.location = request.get("location")
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {"message": "Personal information saved successfully", "id": profile.id}

    except Exception as e:
        print(f"Error in update_personal_identifiers: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{email}/education")
async def update_education(email: str, request: dict, db: DbDep):
    try:
        email = email.strip().lower()
        profile = (
            db.query(CandidateProfile)
            .filter(CandidateProfile.candidate_email == email)
            .first()
        )

        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        education_data = request.get("education")
        if education_data is None:
            raise HTTPException(status_code=400, detail="Missing 'education' field in request body")

        profile.education = education_data
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {
            "message": "Education saved successfully",
            "id": profile.id,
            "education": profile.education
        }

    except Exception as e:
        print(f"Error in update_education: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{email}/experience")
async def update_experience(email: str, request: dict, db: DbDep):
    try:
        email = email.strip().lower()
        profile = (
            db.query(CandidateProfile)
            .filter(CandidateProfile.candidate_email == email)
            .first()
        )

        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        experience_data = request.get("experience")
        if experience_data is None:
            raise HTTPException(status_code=400, detail="Missing 'experience' field in request body")

        profile.experience = experience_data
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {
            "message": "Experience saved successfully",
            "id": profile.id,
            "experience": profile.experience
        }

    except Exception as e:
        print(f"Error in update_experience: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{email}/skills")
async def update_skills(email: str, request: dict, db: DbDep):
    try:
        email = email.strip().lower()
        profile = (
            db.query(CandidateProfile)
            .filter(CandidateProfile.candidate_email == email)
            .first()
        )

        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        incoming_data = request.get("skills") or request.get("exp_skill")
        if incoming_data is None:
            raise HTTPException(status_code=400, detail="Missing 'skills' or 'exp_skill' in request body")

        filtered_skills = {
            "HardSkills": incoming_data.get("HardSkills", []),
            "SoftSkills": incoming_data.get("SoftSkills", [])
        }

        profile.skills = filtered_skills
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {
            "message": "Skills saved successfully",
            "id": profile.id,
            "skills": profile.skills
        }

    except Exception as e:
        print(f"Error in update_skills: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{email}/language")
async def update_language(email: str, request: Request, db: DbDep):
    try:
        email = email.strip().lower()
        data = await request.json()
        incoming_data = data.get("languageProficiencies")

        if incoming_data is None:
            raise HTTPException(status_code=400, detail="Missing 'languageProficiencies'")

        profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()
        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        profile.language_proficiencies = incoming_data
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {"message": "Language proficiency saved successfully", "languageProficiency": profile.language_proficiencies}

    except Exception as e:
        print(f"Error in update_language: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{email}/neurodivergent_strengths")
async def update_neurodivergent_strengths(email: str, request: Request, db: DbDep):
    try:
        email = email.strip().lower()
        data = await request.json()

        incoming_data = data.get("neurodivergent_strengths")
        if incoming_data is None:
            raise HTTPException(
                status_code=400,
                detail="Missing 'neurodivergent_strengths' field in request body"
            )

        profile = db.query(CandidateProfile).filter(
            CandidateProfile.candidate_email == email
        ).first()

        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        profile.neurodivergent_strengths = incoming_data
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {
            "message": "Neurodivergent strengths saved successfully",
            "neurodivergent_strengths": profile.neurodivergent_strengths,
        }

    except Exception as e:
        print(f"Error in update_neurodivergent_strengths: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{email}/environment")
async def update_environment(email: str, request: Request, db: DbDep):
    try:
        email = email.strip().lower()
        data = await request.json()

        incoming_data = data.get("environment")
        if incoming_data is None:
            raise HTTPException(
                status_code=400,
                detail="Missing 'environment' field in request body"
            )

        profile = db.query(CandidateProfile).filter(
            CandidateProfile.candidate_email == email
        ).first()

        if not profile:
            profile = CandidateProfile(candidate_email=email, profile_completion=0)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        profile.environment = incoming_data
        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {
            "message": "Environment saved successfully",
            "environment": profile.environment,
        }

    except Exception as e:
        print(f"Error in update_environment: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# =========================================================
# 4️⃣ PATCH - Update Candidate Resume (all parsed data)
# =========================================================
@router.patch("/{email}/resume")
async def update_candidate_resume(email: str, request: Request, db: DbDep):
    try:
        email = email.strip().lower()
        parsed_data = await request.json()

        profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == email).first()

        if not profile:
            profile = CandidateProfile(
                candidate_email=email,
                profile_completion=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
            print(f"Created new profile for {email}")
        else:
            print(f"Updating existing profile for {email}")

        personal_identifiers = parsed_data.get("personal_identifiers")
        if personal_identifiers is not None:
            profile.personal_identifiers = personal_identifiers
            profile.name = personal_identifiers.get("fullName")
            profile.location = personal_identifiers.get("location")

        # Education
        education_data = parsed_data.get("education")
        if education_data is not None:
            if isinstance(education_data, list):
                processed_education = []
                for item in education_data:
                    if isinstance(item, dict):
                        new_item = {}
                        item_id = item.get("id")
                        if item_id is None:
                            item_id = generate_13_digit_id()
                        new_item["id"] = item_id
                        for key, value in item.items():
                            if key != "id":
                                new_item[key] = value
                        processed_education.append(new_item)
                    else:
                        processed_education.append(item)
                profile.education = processed_education
            else:
                profile.education = education_data

        # Experience
        experience_data = parsed_data.get("experience")
        if experience_data is not None:
            if isinstance(experience_data, list):
                processed_experience = []
                for item in experience_data:
                    if isinstance(item, dict):
                        new_item = {}
                        item_id = item.get("id")
                        if item_id is None:
                            item_id = generate_13_digit_id()
                        new_item["id"] = item_id

                        is_current_value = item.get("isCurrent")
                        if isinstance(is_current_value, str):
                            new_item["isCurrent"] = is_current_value.lower() == "true"
                        elif is_current_value is not None:
                            new_item["isCurrent"] = is_current_value

                        for key, value in item.items():
                            if key not in ["id", "isCurrent"]:
                                new_item[key] = value
                        processed_experience.append(new_item)
                    else:
                        processed_experience.append(item)
                profile.experience = processed_experience
            else:
                profile.experience = experience_data

        # Skills
        skills_data = parsed_data.get("skills")
        if skills_data is not None:
            filtered_skills = {
                "HardSkills": skills_data.get("HardSkills", []),
                "SoftSkills": skills_data.get("SoftSkills", [])
            }
            profile.skills = filtered_skills

        # Language Proficiencies
        language_proficiencies_data = parsed_data.get("language_proficiencies")
        if language_proficiencies_data is not None:
            profile.language_proficiencies = language_proficiencies_data

        # Environment
        environment_data = parsed_data.get("environment")
        if environment_data is not None:
            profile.environment = environment_data

        # Neurodivergent Strengths
        neurodivergent_strengths_data = parsed_data.get("neurodivergent_strengths")
        if neurodivergent_strengths_data is not None:
            profile.neurodivergent_strengths = neurodivergent_strengths_data

        profile.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(profile)

        return {"message": "Resume data updated successfully", "id": profile.id, "email": profile.candidate_email}

    except Exception as e:
        print(f"Error in update_candidate_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update resume data: {str(e)}")


# =========================================================
# 5️⃣ GET - Candidate List with Optional Role Filter
# =========================================================
@router.get("/all/candidate-profiles")
async def get_all_candidate_profiles(db: DbDep):
    """
    Get all candidate profiles where role = CANDIDATE
    """
    try:
        profiles = (
            db.query(CandidateProfile)
            .join(LoginUser, CandidateProfile.candidate_email == LoginUser.email)
            .filter(LoginUser.role == UserRole.CANDIDATE)
            .all()
        )
        
        result = []
        for profile in profiles:
            profile_dict = {k: v for k, v in profile.__dict__.items() if not k.startswith('_sa_instance_state')}
            # ... rest of the parsing logic ...
            result.append(profile_dict)
        
        return result
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    