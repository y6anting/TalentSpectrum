from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import datetime
import os
import shutil
import re

from database.connection import get_db
from database.models.employer import Post_Job, PostJobRequest, Company, CompanyRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

# --- File Upload Settings ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "talent-spectrum-app", "public", "logo"))
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def sanitize_filename(name: str) -> str:
    """Remove unsafe characters for filenames."""
    name = re.sub(r"[^\w\s-]", "", name)
    return re.sub(r"\s+", "_", name).lower()

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
async def update_company(email: str, db: DbDep, company_data: CompanyRequest):
    existing = db.query(Company).filter(Company.email == email).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    
    for key, value in company_data.dict(exclude_unset=True).items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Company updated", "company": existing}

# =============================
#      LOGO UPLOAD ROUTE
# =============================

@router.post("/company/{email}/upload-company-logo")
async def upload_company_logo(email: str, db: DbDep, file: UploadFile = File(...)):
    company_profile = db.query(Company).filter(Company.email == email).first()
    if not company_profile:
        raise HTTPException(status_code=404, detail="Company not found for this email.")

    allowed_extensions = ["jpg", "jpeg", "png", "gif", "svg"]
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")

    if not company_profile.name:
        raise HTTPException(status_code=500, detail="Company name is missing for profile.")

    sanitized_name = sanitize_filename(company_profile.name)
    timestamp = int(datetime.now().timestamp())
    new_filename = f"{sanitized_name}_{timestamp}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, new_filename)

    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        print(f"Saving logo to: {file_path}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    logo_url = f"/logo/{new_filename}"
    company_profile.logo_url = logo_url
    db.commit()
    db.refresh(company_profile)

    return JSONResponse(status_code=200, content={"message": "Logo uploaded successfully", "logo_url": logo_url})

