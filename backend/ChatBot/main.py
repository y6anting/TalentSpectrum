from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import Message
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Chatbot Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Pydantic schema ----------
class MessageIn(BaseModel):
    sender: str
    text: str

class MessageOut(BaseModel):
    sender: str
    text: str
    timestamp: datetime

# ---------- Chat endpoint ----------
@app.post("/chat", response_model=MessageOut)
def handle_message(message: MessageIn, db: Session = Depends(get_db)):
    # Save user message
    user_msg = Message(sender=message.sender, text=message.text)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # --- Simple AI logic (replace later with OpenAI call) ---
    if "hello" in message.text.lower():
        ai_text = "Hi there! How can I help you today?"
    else:
        ai_text = f"You said: {message.text}"

    # Save AI response
    ai_msg = Message(sender="ai", text=ai_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg

# ---------- Chat history endpoint ----------
@app.get("/history", response_model=list[MessageOut])
def get_history(db: Session = Depends(get_db)):
    messages = db.query(Message).order_by(Message.id).all()
    return messages