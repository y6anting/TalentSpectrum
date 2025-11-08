# backend/pg_db/routers/company.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any

from database.connection import get_db
# <--- ADD FullProfileResponse to the import below
from database.models.employer import Post_Job, PostJobRequest, Company, CompanyRequest, FullProfileResponse
from database.models.users import LoginUser, UserRole

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

# Company endpoints
@router.get("/all/employer-profiles", response_model=List[Dict[str, Any]])
async def get_all_employer_profiles(db: DbDep):
    """
    Get all employer profiles (job postings) associated with users
    who have the EMPLOYER role.
    """
    try:
        # Join LoginUser and Post_Job tables
        # Filter for users with role EMPLOYER
        # Select all Post_Job records that match
        employer_job_postings = (
            db.query(Post_Job)
            .join(LoginUser, Post_Job.employer_email == LoginUser.email)
            .filter(LoginUser.role == UserRole.EMPLOYER)
            .all()
        )

        result = []
        for job_posting in employer_job_postings:
            # Convert SQLAlchemy model instance to a dictionary
            # Exclude SQLAlchemy's internal state attribute
            job_posting_dict = {
                k: v for k, v in job_posting.__dict__.items()
                if not k.startswith('_sa_instance_state')
            }
            # Handle enum conversion if necessary (e.g., UserRole.EMPLOYER -> "employer")
            # This example assumes Post_Job doesn't directly store enums that need conversion
            # but it's good practice to consider for other fields.

            result.append(job_posting_dict)

        return result
    except Exception as e:
        print(f"Error fetching employer profiles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch employer profiles: {str(e)}")


# NEW: Endpoint to get all full profiles (job posting + company info)
@router.get("/all/full_profile", response_model=List[FullProfileResponse])
async def get_all_full_profiles(db: DbDep):
    """
    Get all combined job postings and company profiles.
    Matches Post_Job records with Company profiles using employer_email/email.
    """
    try:
        # Perform an inner join between Post_Job and Company tables
        # where Post_Job.employer_email matches Company.email
        # This query will return tuples of (Post_Job_object, Company_object)
        full_profiles_data = (
            db.query(Post_Job, Company)
            .join(Company, Post_Job.employer_email == Company.email)
            .all()
        )

        result = []
        for job_posting, company_profile in full_profiles_data:
            # Combine attributes from both objects into a single dictionary
            # Mapping to the FullProfileResponse Pydantic model
            combined_data = {
                "job_id": job_posting.id,
                "employer_email": job_posting.employer_email,
                "job_title": job_posting.job_title,
                "job_type": job_posting.job_type,
                "work_mode": job_posting.work_mode,
                "experience_level": job_posting.experience_level,
                "job_location": job_posting.location, # Mapped to job_location
                "salary_range": job_posting.salary_range,
                "job_summary": job_posting.job_summary,
                "job_requirements": job_posting.job_requirements,
                "soft_skills": job_posting.soft_skills,
                "flexible_work_hour": job_posting.flexible_work_hour,
                "sensory_friendly_environment": job_posting.sensory_friendly_environment,
                "peer_support_system": job_posting.peer_support_system,
                "dedicated_workspace": job_posting.dedicated_workspace,
                "neurodiversity_awareness_training": job_posting.neurodiversity_awareness_training,
                "regular_supervisor_check_in": job_posting.regular_supervisor_check_in,
                "zero_tolerance_bullying_mobbing_policy": job_posting.zero_tolerance_bullying_mobbing_policy,
                "augmentative_alternative_communication": job_posting.augmentative_alternative_communication,
                "quiet_room": job_posting.quiet_room,
                "sensory_aids": job_posting.sensory_aids,
                "provide_visual_guidance": job_posting.provide_visual_guidance,
                "uses_project_management_tools": job_posting.uses_project_management_tools,
                "optional_social_event": job_posting.optional_social_event,
                "mental_health_support": job_posting.mental_health_support,
                "near_public_transport": job_posting.near_public_transport,

                "company_id": company_profile.id,
                "company_name": company_profile.name,
                "company_industry": company_profile.industry,
                "company_location": company_profile.location, # Mapped to company_location
                "company_website": company_profile.website,
                "company_employees": company_profile.employees,
                "company_size": company_profile.size,
                "company_inclusion_score": company_profile.inclusion_score,
                "company_certifications": company_profile.certifications,
                "company_description": company_profile.description,
                "company_founded_year": company_profile.founded_year,
                "company_type": company_profile.company_type,
                "company_logo_url": company_profile.logo_url,
            }
            # Validate and convert using Pydantic model
            result.append(FullProfileResponse(**combined_data))

        return result
    except Exception as e:
        print(f"Error fetching full profiles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch full profiles: {str(e)}")