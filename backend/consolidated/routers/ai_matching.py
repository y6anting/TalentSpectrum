from fastapi import APIRouter, HTTPException, Query
import asyncio
from typing import Optional

from ai_gem_match import conduct_ai_job_matching, conduct_ai_job_matching_for_candidate, api_key, MODEL_NAME

router = APIRouter()

@router.post("/run_matching", summary="Run AI job matching process")
async def run_ai_matching(candidate_email: Optional[str] = Query(None, description="Optional: Match specific candidate with all jobs. If not provided, matches all candidates with all jobs.")):
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured. Please set it in the backend .env file before running AI matching."
        )

    try:
        loop = asyncio.get_running_loop()
        if candidate_email:
            # Match specific candidate with all jobs
            await loop.run_in_executor(None, conduct_ai_job_matching_for_candidate, candidate_email)
            return {
                "status": "success",
                "message": f"AI job matching completed for candidate {candidate_email}. Results have been stored in the database."
            }
        else:
            # Match all candidates with all jobs (for employers)
            await loop.run_in_executor(None, conduct_ai_job_matching)
            return {
                "status": "success",
                "message": "AI job matching completed successfully. Results have been stored in the database."
            }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error during AI matching: {exc}")

@router.get("/status", summary="Check AI matching service status")
async def get_matching_status():
    return {
        "service": "AI Job Matching",
        "status": "operational" if api_key else "not_configured",
        "gemini_api_configured": bool(api_key),
        "model": MODEL_NAME if api_key else "N/A"
    }