# backend/pg_db/database/models/users.py

from sqlalchemy import Column, Integer, String, Enum
import enum

# IMPORT Base from connection.py
from database.connection import Base # <--- Keep this line

class UserRole(str, enum.Enum):
    CANDIDATE = "CANDIDATE"
    EMPLOYER = "EMPLOYER"
    JOB_COACH = "JOB_COACH"

class LoginUser(Base):
    __tablename__ = "login_user"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CANDIDATE)

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', role='{self.role}')>"