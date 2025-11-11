import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

router = APIRouter()

load_dotenv()

class QuestionRequest(BaseModel):
    query: str

@router.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    Query the TrainerBook knowledge base
    Note: Requires MongoDB Atlas setup with vector search index
    """
    try:
        # For now, return a placeholder response
        # Full implementation requires MongoDB Atlas connection and vector embeddings
        return {
            "query": request.query,
            "answer": "TrainerBook service is under configuration. Please ensure MongoDB Atlas is set up with the Employment Transition Programme documents.",
            "success": False,
            "message": "MongoDB Atlas vector search required"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying TrainerBook: {str(e)}")

@router.get("/")
def trainerbook_status():
    return {
        "message": "TrainerBook RAG Service",
        "status": "requires_mongodb_atlas",
        "description": "Q&A system for Employment Transition Programme"
    }

