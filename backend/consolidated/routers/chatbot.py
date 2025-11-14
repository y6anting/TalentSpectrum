from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import traceback

from database.models.pdf_chat import ask_combined

router = APIRouter()


class RAGChatRequest(BaseModel):
    message: str


class RAGChatResponse(BaseModel):
    answer: str
    source: str


@router.post("/rag", response_model=RAGChatResponse)
async def rag_chat(request: RAGChatRequest):
    try:
        result = await ask_combined(request.message)
        return RAGChatResponse(**result)
    except FileNotFoundError as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error while processing RAG request: {str(e)}",
        )