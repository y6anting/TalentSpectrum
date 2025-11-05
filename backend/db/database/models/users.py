import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean
from sqlalchemy.orm import relationship
from database.connection import Base # Assuming Base is imported from here

class UserType(enum.Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer"
    JOB_COACH = "job-coach"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    user_type = Column(Enum(UserType), default=UserType.CANDIDATE)
    is_active = Column(Boolean, default=True) # Added for future use, e.g., account activation

    # You can add relationships here if needed, e.g.,
    # profiles = relationship("Profile", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', type='{self.user_type.value}')>"