# backend/pg_db/routers/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional,Annotated
from database.connection import get_db
from database.models.users import LoginUser, UserRole

router = APIRouter()

# Pydantic models for request and response
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.CANDIDATE # Allow specifying role, default to CANDIDATE

# NEW: Pydantic model for login request
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        orm_mode = True # Enable ORM mode for Pydantic

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

# NEW: Login endpoint
@router.post("/login", response_model=UserResponse) # Return UserResponse on successful login
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(LoginUser).filter(LoginUser.email == user_credentials.email).first()

    # Check if user exists and password matches (no hashing as per instruction)
    if not db_user or db_user.password != user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}, # Standard header for unauthorized
        )
    
    # If authentication is successful, return the user details
    return db_user # Pydantic's orm_mode will convert this to UserResponse


DbDep = Annotated[Session, Depends(get_db)]

@router.get("/")
async def login_user(db: DbDep):
    return db.query(LoginUser).all()

@router.get("/{candidate_email}")
async def login_user(candidate_email: str, db: DbDep):
    users = db.query(LoginUser).filter(LoginUser.email == candidate_email).first()
    return users