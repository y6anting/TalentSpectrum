from __future__ import annotations

from typing import Annotated, List
import os
import shutil
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import inspect

from database.connection import get_db
from database.models.job_coach_profile import (
    JobCoachProfile,
    JobCoachProfileCreate,
    JobCoachProfileResponse,
    JobCoachProfileUpdate,
)
from database.models.mock_interview import InterviewReport
from database.models.appointment import Appointment

router = APIRouter(prefix="/job-coach", tags=["Job Coach"])

DbDep = Annotated[Session, Depends(get_db)]

def sanitize_filename(name: str) -> str:
    """Sanitize filename by removing special characters"""
    import re
    return re.sub(r"\s+", "_", name).lower()


@router.get("/profile/{coach_email}", response_model=JobCoachProfileResponse)
def get_job_coach_profile(coach_email: str, db: DbDep):
    """Get job coach profile by email"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found")
    return profile


@router.post("/profile/{coach_email}", response_model=JobCoachProfileResponse)
def create_or_update_job_coach_profile(
    coach_email: str, payload: JobCoachProfileCreate, db: DbDep
):
    """Create or update job coach profile"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )

    if profile:
        # Update existing profile - only update fields that are in the model
        valid_fields = {
            'name', 'organization', 'specializations', 'certifications', 
            'bio', 'experience_years', 'assigned_candidates', 
            'availability', 'contact_preferences'
        }
        for field, value in payload.dict(exclude_unset=True).items():
            if field in valid_fields and value is not None:
                setattr(profile, field, value)
    else:
        # Create new profile
        profile = JobCoachProfile(
            coach_email=coach_email,
            name=payload.name or "",
            organization=payload.organization,
            specializations=payload.specializations or [],
            certifications=payload.certifications or [],
            bio=payload.bio,
            experience_years=payload.experience_years,
            assigned_candidates=payload.assigned_candidates or [],
            availability=payload.availability,
            contact_preferences=payload.contact_preferences,
        )
        db.add(profile)

    # Calculate profile completion
    completion_fields = [
        profile.name,
        profile.organization,
        profile.bio,
        profile.experience_years,
    ]
    completion = sum(1 for f in completion_fields if f) * 25
    profile.profile_completion = min(completion, 100)

    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/profile/{coach_email}", response_model=JobCoachProfileResponse)
def update_job_coach_profile_partial(
    coach_email: str, payload: JobCoachProfileUpdate, db: DbDep
):
    """Partially update job coach profile"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found")

    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/profile/{coach_email}/assign-candidate")
def assign_candidate(coach_email: str, candidate_email: str, db: DbDep):
    """Assign a candidate to this job coach"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found")

    if candidate_email not in profile.assigned_candidates:
        profile.assigned_candidates.append(candidate_email)
        db.commit()

    return {"message": "Candidate assigned successfully"}


@router.delete("/profile/{coach_email}/unassign-candidate")
def unassign_candidate(coach_email: str, candidate_email: str, db: DbDep):
    """Remove a candidate assignment from this job coach"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found")

    if candidate_email in profile.assigned_candidates:
        profile.assigned_candidates.remove(candidate_email)
        db.commit()

    return {"message": "Candidate unassigned successfully"}


@router.get("/profile/{coach_email}/candidates")
def get_assigned_candidates(coach_email: str, db: DbDep):
    """Get list of candidates assigned to this job coach"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found")

    return {"assigned_candidates": profile.assigned_candidates}


@router.get("/profile/{coach_email}/candidate-reports")
def get_candidate_reports_for_coach(coach_email: str, db: DbDep):
    """Get all reports for candidates assigned to this job coach"""
    profile = (
        db.query(JobCoachProfile)
        .filter(JobCoachProfile.coach_email == coach_email)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found")

    if not profile.assigned_candidates:
        return []

    # Fetch latest report for each assigned candidate
    reports = (
        db.query(InterviewReport)
        .filter(InterviewReport.candidate_email.in_(profile.assigned_candidates))
        .order_by(InterviewReport.created_at.desc())
        .all()
    )

    return reports


@router.get("/all")
def get_all_job_coaches(db: DbDep):
    """Get all job coaches without appointments"""
    # Check if profile_picture_url column exists
    inspector = inspect(db.get_bind())
    try:
        existing_columns = {c["name"] for c in inspector.get_columns("job_coach_profiles")}
        has_profile_picture_url = "profile_picture_url" in existing_columns
    except Exception:
        has_profile_picture_url = False
    
    coaches = db.query(JobCoachProfile).all()
    
    result = []
    for coach in coaches:
        coach_data = {
            "email": coach.coach_email,
            "name": coach.name,
            "organization": coach.organization,
            "specializations": coach.specializations or [],
            "certifications": coach.certifications or [],
            "bio": coach.bio,
            "experience_years": coach.experience_years,
        }
        
        # Only include profile_picture_url if the column exists
        if has_profile_picture_url:
            coach_data["profile_picture_url"] = getattr(coach, "profile_picture_url", None)
        
        result.append(coach_data)
    
    return result


@router.get("/all-with-appointments")
def get_all_job_coaches_with_appointments(db: DbDep):
    """Get all job coaches with their available appointment slots"""
    from datetime import datetime, timedelta
    
    # Check if profile_picture_url column exists in the database
    inspector = inspect(db.get_bind())
    try:
        existing_columns = {c["name"] for c in inspector.get_columns("job_coach_profiles")}
        has_profile_picture_url = "profile_picture_url" in existing_columns
    except Exception:
        has_profile_picture_url = False
    
    # Get all job coach profiles
    coaches = db.query(JobCoachProfile).all()
    
    # Get all appointments
    all_appointments = db.query(Appointment).all()
    
    # Generate weekday slots (Monday to Friday) starting from today
    def generate_weekday_slots(start_date: datetime, weeks: int = 12):
        """Generate fixed weekday time slots (Monday-Friday) starting from the given date"""
        weekday_slots = []
        current_datetime = datetime.now()
        current_date = current_datetime.date()
        current_weekday = current_date.weekday()  # 0=Monday, 1=Tuesday, ..., 4=Friday, 5=Saturday, 6=Sunday
        
        # Fixed working hours: every 2 hours from 9 AM to 5 PM
        working_hours = [9, 11, 13, 15, 17]
        
        # Determine start date: if today is Monday-Friday and before 5 PM, start from today
        # Otherwise, start from next Monday
        if current_weekday < 5:  # Monday (0) through Friday (4)
            if current_datetime.hour < 17:  # Before 5 PM, include today
                start_date_obj = current_date
            else:
                # After 5 PM on a weekday, start from next Monday
                days_until_monday = 7 - current_weekday
                start_date_obj = current_date + timedelta(days=days_until_monday)
        else:  # Saturday (5) or Sunday (6)
            # Start from next Monday
            days_until_monday = (7 - current_weekday) % 7
            if days_until_monday == 0:
                days_until_monday = 7
            start_date_obj = current_date + timedelta(days=days_until_monday)
        
        # Generate slots for the specified number of weeks
        for week in range(weeks):
            # Monday through Friday (weekdays 0-4)
            for day_offset in range(5):  # Monday=0, Tuesday=1, ..., Friday=4
                weekday_date = start_date_obj + timedelta(weeks=week, days=day_offset)
                
                # Skip if this weekday is in the past
                if weekday_date < current_date:
                    continue
                
                # Generate slots for each working hour
                for hour in working_hours:
                    weekday_datetime = datetime.combine(weekday_date, datetime.min.time()).replace(
                        hour=hour, minute=0, second=0, microsecond=0
                    )
                    
                    # Only add future slots (skip if it's today and the hour has passed)
                    if weekday_datetime > current_datetime:
                        weekday_slots.append({
                            "id": None,  # Virtual slot, not in database
                            "dateTime": weekday_datetime.isoformat(),
                            "candidate": None,
                        })
        
        return weekday_slots
    
    # Build response with coaches and their available appointments
    result = []
    now = datetime.now()
    weekday_slots = generate_weekday_slots(now)
    
    for coach in coaches:
        # Filter appointments for this coach that are available (candidate is None) and in the future
        coach_appointments = [
            {
                "id": apt.id,
                "dateTime": apt.dateTime.isoformat() if apt.dateTime else None,
                "candidate": apt.candidate,
            }
            for apt in all_appointments
            if apt.jobCoach == coach.coach_email 
            and apt.candidate is None 
            and apt.dateTime 
            and apt.dateTime > now
        ]
        
        # Add weekday slots (virtual appointments that are always available)
        # Convert weekday slots to datetime for comparison
        weekday_datetimes = {
            slot["dateTime"] for slot in weekday_slots
        }
        
        # Only add weekday slots that don't conflict with existing appointments
        existing_datetimes = {
            apt["dateTime"] for apt in coach_appointments
        }
        
        # Add weekday slots that don't already exist
        for weekday_slot in weekday_slots:
            if weekday_slot["dateTime"] not in existing_datetimes:
                coach_appointments.append(weekday_slot)
        
        # Sort appointments by dateTime
        coach_appointments.sort(key=lambda x: x["dateTime"] if x["dateTime"] else "")
        
        coach_data = {
            "email": coach.coach_email,
            "name": coach.name,
            "organization": coach.organization,
            "specializations": coach.specializations or [],
            "certifications": coach.certifications or [],
            "bio": coach.bio,
            "experience_years": coach.experience_years,
            "available_appointments": coach_appointments,
        }
        
        # Only include profile_picture_url if the column exists
        if has_profile_picture_url:
            coach_data["profile_picture_url"] = getattr(coach, "profile_picture_url", None)
        else:
            coach_data["profile_picture_url"] = None
        
        result.append(coach_data)
    
    return result


@router.post("/profile/{coach_email}/upload-profile-picture")
async def upload_job_coach_profile_picture(coach_email: str, db: DbDep, file: UploadFile = File(...)):
    """Upload profile picture for a job coach"""
    # Check if profile_picture_url column exists
    inspector = inspect(db.get_bind())
    try:
        existing_columns = {c["name"] for c in inspector.get_columns("job_coach_profiles")}
        has_profile_picture_url = "profile_picture_url" in existing_columns
    except Exception:
        has_profile_picture_url = False
    
    if not has_profile_picture_url:
        raise HTTPException(
            status_code=500, 
            detail="profile_picture_url column does not exist in the database. Please run the migration script to add it."
        )
    
    profile = db.query(JobCoachProfile).filter(JobCoachProfile.coach_email == coach_email).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Job coach profile not found for this email.")

    allowed_extensions = ["jpg", "jpeg", "png", "gif", "svg"]
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")

    # Use coach name or email for filename
    sanitized_name = sanitize_filename(profile.name or coach_email.split('@')[0])
    timestamp = int(datetime.now().timestamp())
    new_filename = f"job_coach_{sanitized_name}_{timestamp}.{file_extension}"
    
    # Profile pictures directory - match profiles.py path calculation exactly
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Goes to routers/
    PROFILE_PICTURES_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "talent-spectrum-app", "public", "profile-pictures"))
    file_path = os.path.join(PROFILE_PICTURES_DIR, new_filename)

    try:
        os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)
        print(f"Saving job coach profile picture to: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    profile_picture_url = f"/profile-pictures/{new_filename}"
    
    # Update profile with picture URL
    profile.profile_picture_url = profile_picture_url
    
    db.commit()
    db.refresh(profile)

    return JSONResponse(status_code=200, content={"message": "Profile picture uploaded successfully", "profile_picture_url": profile_picture_url})
