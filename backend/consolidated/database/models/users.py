from sqlalchemy import Column, Integer, String, Enum
import enum
from database.connection import Base
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Define UserRole enum
class UserRole(str, enum.Enum):
    CANDIDATE = "CANDIDATE"
    EMPLOYER = "EMPLOYER"
    JOB_COACH = "JOB_COACH"

# SQLAlchemy model
class LoginUser(Base):
    __tablename__ = "login_user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CANDIDATE)

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', role='{self.role}')>"

# Pydantic schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str 
    role: Optional[UserRole] = UserRole.CANDIDATE

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str