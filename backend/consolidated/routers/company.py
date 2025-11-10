# backend/consolidated/routers/company.py
# From pg_db - employer profiles and company management

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List, Dict, Any

from database.connection import get_db
from database.models.employer import Post_Job, PostJobRequest, Company, CompanyRequest
from database.models.users import LoginUser, UserRole

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/all/employer-profiles", response_model=List[Dict[str, Any]])
async def get_all_employer_profiles(db: DbDep):
    """
    Get all employer profiles (job postings) associated with users
    who have the EMPLOYER role.
    """
    try:
        # Join LoginUser and Post_Job tables
        # Filter for users with role EMPLOYER
        employer_job_postings = (
            db.query(Post_Job)
            .join(LoginUser, Post_Job.employer_email == LoginUser.email)
            .filter(LoginUser.role == UserRole.EMPLOYER)
            .all()
        )

        result = []
        for job_posting in employer_job_postings:
            # Convert SQLAlchemy model instance to a dictionary
            job_posting_dict = {
                k: v for k, v in job_posting.__dict__.items()
                if not k.startswith('_sa_instance_state')
            }
            result.append(job_posting_dict)

        return result
    except Exception as e:
        print(f"Error fetching employer profiles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch employer profiles: {str(e)}")

