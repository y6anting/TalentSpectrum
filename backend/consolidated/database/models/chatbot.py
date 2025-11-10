from database.connection import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from pydantic import BaseModel

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)  # "user" or "ai"
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MessageIn(BaseModel):
    sender: str
    text: str

class MessageOut(BaseModel):
    sender: str
    text: str
    timestamp: datetime

    class Config:
        from_attributes = True

