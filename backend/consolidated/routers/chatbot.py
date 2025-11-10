from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated
from database.connection import get_db
from database.models.chatbot import Message, MessageIn, MessageOut

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=MessageOut)
def handle_message(message: MessageIn, db: DbDep):
    # Save user message
    user_msg = Message(sender=message.sender, text=message.text)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Simple AI logic (can be replaced with OpenAI/Gemini integration)
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

@router.delete("/clear_all")
def clear_all_messages(db: DbDep):
    db.query(Message).delete()
    db.commit()
    return {"message": "All chat messages have been cleared."}

@router.get("/history", response_model=list[MessageOut])
def get_history(db: DbDep):
    messages = db.query(Message).order_by(Message.id).all()
    return messages

