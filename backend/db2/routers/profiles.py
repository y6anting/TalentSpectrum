from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from database.connection import get_db
from database.models.candidate import Profile, ProfileRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_profiles(db: DbDep):
    return db.query(Profile).all()

@router.post("/")
async def create_profile(db: DbDep, profile: ProfileRequest):
    new_profile = Profile(**profile.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return {"message": "Profile added", "profile": new_profile}

@router.put("/{profile_id}")
async def update_profile(db: DbDep, profile_id: int, profile: ProfileRequest):
    existing = db.query(Profile).filter(Profile.id == profile_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    for key, value in profile.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Profile updated", "profile": existing}

@router.delete("/{profile_id}")
async def delete_profile(db: DbDep, profile_id: int):
    existing = db.query(Profile).filter(Profile.id == profile_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    db.delete(existing)
    db.commit()
    return {"message": "Profile deleted"}