from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import datetime

from database.connection import get_db
from database.models.candidate import JobApplication, SavedJob, CandidateProfile
from database.models.employer import Post_Job
from pydantic import BaseModel

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

# Pydantic schemas
class JobApplicationRequest(BaseModel):
    candidate_email: str
    job_id: int
    accommodations_requested: bool = False

class SavedJobRequest(BaseModel):
    candidate_email: str
    job_id: int

class JobApplicationResponse(BaseModel):
    id: int
    candidate_id: int
    job_title: str
    company: str
    applied_date: datetime
    status: str
    location: str
    salary: str
    accommodations_requested: bool
    score: int

    class Config:
        from_attributes = True

class SavedJobResponse(BaseModel):
    id: int
    candidate_id: int
    job_title: str
    company: str
    location: str
    job_type: str
    salary: str
    is_inclusive: bool
    has_accommodations: bool
    created_at: datetime

    class Config:
        from_attributes = True

class EmployerApplicationResponse(BaseModel):
    id: int
    candidate_name: str
    candidate_email: str
    job_title: str
    applied_date: datetime
    status: str
    accommodations_requested: bool
    score: int | None = None
    interview_date: datetime | None = None
    location: str | None = None
    salary: str | None = None

    class Config:
        from_attributes = True

# Job Application endpoints
@router.post("/apply")
async def apply_to_job(db: DbDep, application: JobApplicationRequest):
    try:
        # Get candidate profile by email
        candidate = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == application.candidate_email).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate profile not found")

        # Get job details
        job = db.query(Post_Job).filter(Post_Job.id == application.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if already applied
        existing_application = db.query(JobApplication).filter(
            # JobApplication.candidate_id == candidate.id,
            JobApplication.candidate_email == candidate.candidate_email,
            JobApplication.job_title == job.job_title,
            JobApplication.company == job.employer_email.split('@')[0]
        ).first()

        if existing_application:
            raise HTTPException(status_code=400, detail="You have already applied to this job")

        # Create new application
        new_application = JobApplication(
            # candidate_id=candidate.id,
            candidate_email = candidate.candidate_email,
            job_title=job.job_title,
            company=job.employer_email.split('@')[0].replace('.', ' ').replace('_', ' ').title(),
            applied_date=datetime.utcnow(),
            status="under_review",
            location=job.location,
            salary=f"RM{job.salary_range}k - RM{job.salary_range + 20}k / annum",
            accommodations_requested=application.accommodations_requested,
            score=85  # Default score, could be calculated based on match
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return {"message": "Application submitted successfully", "application": new_application}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error applying to job: {e}")

@router.get("/applications/{candidate_email}")
async def get_candidate_applications(candidate_email: str, db: DbDep):
    try:
        candidate = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == candidate_email).first()
        
        # If no profile exists yet, just return empty array
        if not candidate:
            return []

        # applications = db.query(JobApplication).filter(JobApplication.candidate_id == candidate.id).all()
        applications = db.query(JobApplication).filter(JobApplication.candidate_email == candidate.candidate_email).all()
        return applications

    except Exception as e:
        print(f"Error fetching applications: {e}")
        # Return empty array instead of 500 error
        return []

@router.get("/applications/employer/{employer_email}")
async def get_employer_applications(employer_email: str, db: DbDep):
    try:
        company_key = employer_email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
        results = (
            db.query(JobApplication, CandidateProfile)
            .join(CandidateProfile, JobApplication.candidate_id == CandidateProfile.id)
            .filter(JobApplication.company == company_key)
            .all()
        )
        apps = []
        for application, candidate in results:
            apps.append({
                "id": application.id,
                "candidate_name": candidate.name,
                "candidate_email": candidate.email,
                "job_title": application.job_title,
                "applied_date": application.applied_date,
                "status": application.status,
                "accommodations_requested": application.accommodations_requested,
                "score": application.score,
                "interview_date": application.interview_date,
                "location": application.location,
                "salary": application.salary,
            })
        return apps
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employer applications: {e}")

# Saved Jobs endpoints
@router.post("/save")
async def save_job(db: DbDep, saved_job: SavedJobRequest):
    try:
        # Get candidate profile by email
        candidate = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == saved_job.candidate_email).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate profile not found")

        # Get job details
        job = db.query(Post_Job).filter(Post_Job.id == saved_job.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if already saved
        existing_saved_job = db.query(SavedJob).filter(
            SavedJob.candidate_email == candidate.candidate_email,
            SavedJob.job_title == job.job_title,
            SavedJob.company == job.employer_email.split('@')[0]
        ).first()

        if existing_saved_job:
            raise HTTPException(status_code=400, detail="Job already saved")

        # Calculate accommodations friendly
        accommodations_friendly = (
            job.flexible_work_hour or
            job.sensory_friendly_environment or
            job.peer_support_system or
            job.dedicated_workspace or
            job.neurodiversity_awareness_training or
            job.regular_supervisor_check_in or
            job.zero_tolerance_bullying_mobbing_policy or
            job.augmentative_alternative_communication or
            job.quiet_room or
            job.sensory_aids or
            job.provide_visual_guidance or
            job.uses_project_management_tools or
            job.mental_health_support or
            job.near_public_transport
        )

        # Create new saved job
        new_saved_job = SavedJob(
            candidate_email=candidate.candidate_email,
            job_title=job.job_title,
            company=job.employer_email.split('@')[0].replace('.', ' ').replace('_', ' ').title(),
            location=job.location,
            job_type=job.job_type,
            salary=f"RM{job.salary_range}k - RM{job.salary_range + 20}k / annum",
            is_inclusive=accommodations_friendly,
            has_accommodations=accommodations_friendly,
            created_at=datetime.utcnow()
        )

        db.add(new_saved_job)
        db.commit()
        db.refresh(new_saved_job)

        return {"message": "Job saved successfully", "saved_job": new_saved_job}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving job: {e}")

@router.get("/saved/{candidate_email}")
async def get_saved_jobs(candidate_email: str, db: DbDep):
    try:
        # Check if candidate profile exists, but don't fail if it doesn't
        candidate = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == candidate_email).first()
        
        # If no profile exists yet, just return empty array
        if not candidate:
            return []

        saved_jobs = db.query(SavedJob).filter(SavedJob.candidate_email == candidate.candidate_email).all()
        return saved_jobs

    except Exception as e:
        print(f"Error fetching saved jobs: {e}")
        # Return empty array instead of 500 error
        return []

@router.delete("/saved/{saved_job_id}")
async def unsave_job(saved_job_id: int, db: DbDep):
    try:
        saved_job = db.query(SavedJob).filter(SavedJob.id == saved_job_id).first()
        if not saved_job:
            raise HTTPException(status_code=404, detail="Saved job not found")

        db.delete(saved_job)
        db.commit()

        return {"message": "Job removed from saved jobs"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error removing saved job: {e}")
