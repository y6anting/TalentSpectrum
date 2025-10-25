from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from database.connection import get_db
from database.models.employer import Post_Job, PostJobRequest
# from database.models.job import PostJobRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_jobs(db: DbDep):
    return db.query(Post_Job).all()

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