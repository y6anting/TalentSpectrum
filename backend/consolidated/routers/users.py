# backend/consolidated/routers/users.py
# From pg_db - includes login and register functionality

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Annotated
from database.connection import get_db
from database.models.users import LoginUser, UserRole

router = APIRouter()

# Pydantic models for request and response
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.CANDIDATE

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    db_user = db.query(LoginUser).filter(LoginUser.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user (password not hashed as per request)
    new_user = LoginUser(
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=UserResponse)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(LoginUser).filter(LoginUser.email == user_credentials.email).first()

    # Check if user exists and password matches (no hashing as per instruction)
    if not db_user or db_user.password != user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # If authentication is successful, return the user details
    return db_user

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def get_all_users(db: DbDep):
    return db.query(LoginUser).all()

@router.get("/{candidate_email}")
async def get_user_by_email(candidate_email: str, db: DbDep):
    user = db.query(LoginUser).filter(LoginUser.email == candidate_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
