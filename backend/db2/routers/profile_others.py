from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from database.connection import get_db
from database.models.candidate import Profile_Others
from schemas.profile_others import ProfileOthersRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_profile_others(db: DbDep):
    return db.query(Profile_Others).all()

@router.post("/")
async def create_profile_other(db: DbDep, profile_other: ProfileOthersRequest):
    new_item = Profile_Others(**profile_other.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Profile_others added", "item": new_item}

@router.put("/{item_id}")
async def update_profile_other(db: DbDep, item_id: int, profile_other: ProfileOthersRequest):
    existing = db.query(Profile_Others).filter(Profile_Others.id == item_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in profile_other.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Profile_others updated", "item": existing}

@router.delete("/{item_id}")
async def delete_profile_other(db: DbDep, item_id: int):
    existing = db.query(Profile_Others).filter(Profile_Others.id == item_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(existing)
    db.commit()
    return {"message": "Profile_others deleted"}