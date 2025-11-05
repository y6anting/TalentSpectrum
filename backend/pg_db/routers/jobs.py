# backend/pg_db/routers/jobs.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from database.connection import get_db
from database.models.employer import Post_Job, PostJobRequest, Company, CompanyRequest
# from database.models.job import PostJobRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_jobs(db: DbDep):
    return db.query(Post_Job).all()

@router.get("/employer/{employer_email}")
async def get_jobs_by_employer(employer_email: str, db: DbDep):
    jobs = db.query(Post_Job).filter(Post_Job.employer_email == employer_email).all()
    return jobs

@router.post("/")
async def create_job(db: DbDep, job: PostJobRequest):
    try:
        new_job = Post_Job(**job.dict())
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return {"message": "Job added", "job": new_job}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating job: {e}")

@router.put("/{job_id}")
async def update_job(db: DbDep, job_id: int, job: PostJobRequest):
    existing = db.query(Post_Job).filter(Post_Job.id == job_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in job.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Job updated", "job": existing}

@router.delete("/{job_id}")
async def delete_job(db: DbDep, job_id: int):
    existing = db.query(Post_Job).filter(Post_Job.id == job_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(existing)
    db.commit()
    return {"message": "Job deleted"}

# Company endpoints
@router.get("/company/{email}")
async def get_company_by_email(email: str, db: DbDep):
    company = db.query(Company).filter(Company.email == email).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/company/")
async def create_company(db: DbDep, company: CompanyRequest):
    try:
        # Check if company already exists
        existing = db.query(Company).filter(Company.email == company.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Company with this email already exists")
        
        new_company = Company(**company.dict())
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        return {"message": "Company created", "company": new_company}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating company: {e}")

@router.put("/company/{email}")
async def update_company(email: str, db: DbDep, company: CompanyRequest):
    existing = db.query(Company).filter(Company.email == email).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    
    for key, value in company.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Company updated", "company": existing}