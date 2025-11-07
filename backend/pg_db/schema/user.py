from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from database.models.users import UserType

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    # WARNING: This password will be stored in plain text.
    # This is done ONLY to meet the project's specific requirement.
    password: str = Field(..., min_length=8)
    user_type: UserType = UserType.CANDIDATE

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    user_type: UserType
    is_active: bool

    class Config:
        from_attributes = True # For Pydantic v2, use from_attributes=True. For v1, use orm_mode=True

class UserLogin(BaseModel):
    email: EmailStr
    # WARNING: This password will be compared in plain text.
    # This is done ONLY to meet the project's specific requirement.
    password: str