from sqlalchemy import Column, Integer, String, DateTime
from database.connection import Base

class Appointment(Base):
    __tablename__ = "appointment"
    id = Column(Integer, primary_key=True, index=True)
    jobCoach = Column(String)
    candidate = Column(String)
    dateTime = Column(DateTime)

