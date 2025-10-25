from fastapi import FastAPI, Depends, Path, HTTPException
import models as models
from models import User, Profile, Profile_Others, Post_Job # add the tables
from database import engine, SessionLocal
from typing import Annotated, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, StrictInt, Field
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

db_dependency = Annotated[Session, Depends(get_db)]

# ============================================================
# 👤 USER ENDPOINTS
# ============================================================
class UserRequest(BaseModel):
    username: str
    role: str


@app.get("/users")
async def get_users(db: db_dependency):
    return db.query(User).all()


@app.post("/users")
async def create_user(db: db_dependency, user: UserRequest):
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User added", "user": new_user}


@app.put("/users/{user_id}")
async def update_user(db: db_dependency, user_id: int, user: UserRequest):
    existing = db.query(User).filter(User.id == user_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "User updated", "user": existing}


@app.delete("/users/{user_id}")
async def delete_user(db: db_dependency, user_id: int):
    existing = db.query(User).filter(User.id == user_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(existing)
    db.commit()
    return {"message": "User deleted"}


# ============================================================
# 📄 PROFILE ENDPOINTS
# ============================================================
class ProfileRequest(BaseModel):
    title: str
    author: str
    published_year: StrictInt
    price: Optional[float] = None
    genre: Optional[str] = None
    customer_review: Optional[str] = None


@app.get("/profiles")
async def get_profiles(db: db_dependency):
    return db.query(Profile).all()


@app.post("/profiles")
async def create_profile(db: db_dependency, profile: ProfileRequest):
    new_profile = Profile(**profile.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return {"message": "Profile added", "profile": new_profile}


@app.put("/profiles/{profile_id}")
async def update_profile(db: db_dependency, profile_id: int, profile: ProfileRequest):
    existing = db.query(Profile).filter(Profile.id == profile_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in profile.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Profile updated", "profile": existing}


@app.delete("/profiles/{profile_id}")
async def delete_profile(db: db_dependency, profile_id: int):
    existing = db.query(Profile).filter(Profile.id == profile_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.delete(existing)
    db.commit()
    return {"message": "Profile deleted"}


# ============================================================
# 🧩 PROFILE_OTHERS ENDPOINTS
# ============================================================
class ProfileOthersRequest(BaseModel):
    profile_id: int
    type: str
    value: str


@app.get("/profile_others")
async def get_profile_others(db: db_dependency):
    return db.query(Profile_Others).all()


@app.post("/profile_others")
async def create_profile_other(db: db_dependency, profile_other: ProfileOthersRequest):
    new_item = Profile_Others(**profile_other.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Profile_others added", "item": new_item}


@app.put("/profile_others/{item_id}")
async def update_profile_other(db: db_dependency, item_id: int, profile_other: ProfileOthersRequest):
    existing = db.query(Profile_Others).filter(Profile_Others.id == item_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in profile_other.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Profile_others updated", "item": existing}


@app.delete("/profile_others/{item_id}")
async def delete_profile_other(db: db_dependency, item_id: int):
    existing = db.query(Profile_Others).filter(Profile_Others.id == item_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(existing)
    db.commit()
    return {"message": "Profile_others deleted"}


# ============================================================
# 💼 POST_JOB ENDPOINTS
# ============================================================
class PostJobRequest(BaseModel):
    job_title: str
    job_type: str
    work_mode: str
    experience_level: str
    location: str
    salary_range: int
    job_summary: str
    job_requirements: Optional[str] = None
    soft_skills: Optional[str] = None
    flexible_work_hour: bool = False
    sensory_friendly_environment: bool = False
    peer_support_system: bool = False
    dedicated_workspace: bool = False
    neurodiversity_awareness_training: bool = False
    regular_supervisor_check_in: bool = False
    zero_tolerance_bullying_mobbing_policy: bool = False
    augmentative_alternative_communication: bool = False
    quiet_room: bool = False
    sensory_aids: bool = False
    provide_visual_guidance: bool = False
    uses_project_management_tools: bool = False
    optional_social_event: bool = False
    mental_health_support: bool = False
    near_public_transport: bool = False


@app.get("/jobs")
async def get_jobs(db: db_dependency):
    return db.query(Post_Job).all()


@app.post("/jobs")
async def create_job(db: db_dependency, job: PostJobRequest):
    print("✅ Received job:", job.dict())
    new_job = Post_Job(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job added", "job": new_job}


@app.put("/jobs/{job_id}")
async def update_job(db: db_dependency, job_id: int, job: PostJobRequest):
    existing = db.query(Post_Job).filter(Post_Job.id == job_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in job.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Job updated", "job": existing}


@app.delete("/jobs/{job_id}")
async def delete_job(db: db_dependency, job_id: int):
    existing = db.query(Post_Job).filter(Post_Job.id == job_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(existing)
    db.commit()
    return {"message": "Job deleted"}


# ============================================================
# RUN SERVER
# ============================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)