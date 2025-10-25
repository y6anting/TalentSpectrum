from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from database.connection import get_db
from database.models.candidate import User
from schemas.user import UserRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_users(db: DbDep):
    return db.query(User).all()

@router.post("/")
async def create_user(db: DbDep, user: UserRequest):
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User added", "user": new_user}

@router.put("/{user_id}")
async def update_user(db: DbDep, user_id: int, user: UserRequest):
    existing = db.query(User).filter(User.id == user_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "User updated", "user": existing}

@router.delete("/{user_id}")
async def delete_user(db: DbDep, user_id: int):
    existing = db.query(User).filter(User.id == user_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(existing)
    db.commit()
    return {"message": "User deleted"}