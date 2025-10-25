from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from typing import List, Optional
from database.connection import Base
from pydantic import BaseModel

class UserSkillSchema(BaseModel):
    id: int
    name: Optional[str] = None
    level: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    skills: List[UserSkillSchema] = []
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: str
    
    class Config:
        from_attributes = True

class UserSchema(UserBase):
    id: int
    skills: List[UserSkillSchema] = []

class UserListResponse(BaseModel):
    users: List[UserSchema]
    message: str = None

## Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)

    skills = relationship('UserSkills', back_populates='user', lazy="joined")

class UserSkills(Base):
    __tablename__ = "users_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    name = Column(String, nullable=True)
    level = Column(String, nullable=True)

    user = relationship('User', back_populates='skills')