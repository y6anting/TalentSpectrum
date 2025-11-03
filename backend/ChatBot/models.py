from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String(20), nullable=False)   # 'user' or 'ai'
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())