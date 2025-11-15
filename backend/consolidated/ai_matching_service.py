"""
Standalone AI Matching Service
This service can be run in a separate uvicorn process to perform AI matching.

Usage:
    uvicorn ai_matching_service:app --host 0.0.0.0 --port 8001

Or run directly:
    python ai_matching_service.py
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
from typing import Optional
from contextlib import asynccontextmanager

try:
    from ai_gem_match import conduct_ai_job_matching, conduct_ai_job_matching_for_candidate, api_key, MODEL_NAME
except ImportError:
    # Fallback if running from different directory
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from ai_gem_match import conduct_ai_job_matching, conduct_ai_job_matching_for_candidate, api_key, MODEL_NAME

# Global state to track matching status
matching_status = {
    "is_running": False,
    "progress": 0,
    "total": 0,
    "current_candidate": None,
    "message": "Ready"
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    print("🚀 AI Matching Service starting...")
    print(f"📊 Model: {MODEL_NAME}")
    print(f"🔑 API Key: {'Configured' if api_key else 'NOT CONFIGURED'}")
    yield
    print("🛑 AI Matching Service shutting down...")

app = FastAPI(
    title="AI Matching Service",
    description="Standalone service for AI-powered job matching",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_matching_in_background():
    """Run matching in a background thread"""
    global matching_status
    try:
        matching_status["is_running"] = True
        matching_status["message"] = "Starting AI matching process..."
        matching_status["progress"] = 0
        
        # Run the matching
        conduct_ai_job_matching()
        
        matching_status["is_running"] = False
        matching_status["message"] = "AI matching completed successfully!"
        matching_status["progress"] = 100
    except Exception as e:
        matching_status["is_running"] = False
        matching_status["message"] = f"Error during matching: {str(e)}"
        raise

@app.post("/run_matching")
async def run_ai_matching(background_tasks: BackgroundTasks):
    """
    Run AI job matching for all candidates and all jobs.
    This endpoint triggers the matching process in the background.
    """
    global matching_status
    
    if matching_status["is_running"]:
        raise HTTPException(
            status_code=400,
            detail="AI matching is already running. Please wait for it to complete."
        )
    
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY not configured. Please set it in the backend .env file."
        )
    
    # Reset status
    matching_status = {
        "is_running": True,
        "progress": 0,
        "total": 0,
        "current_candidate": None,
        "message": "Starting matching process..."
    }
    
    # Run matching in background
    loop = asyncio.get_event_loop()
    background_tasks.add_task(
        lambda: loop.run_in_executor(None, run_matching_in_background)
    )
    
    return {
        "status": "started",
        "message": "AI matching process started. Check /status endpoint for progress.",
        "status_endpoint": "/status"
    }

@app.get("/status")
async def get_matching_status():
    """Get the current status of the AI matching process"""
    return {
        "service": "AI Job Matching Service",
        "model": MODEL_NAME,
        "api_key_configured": bool(api_key),
        "status": matching_status
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Matching Service",
        "api_key_configured": bool(api_key)
    }

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "AI Matching Service",
        "version": "1.0.0",
        "endpoints": {
            "run_matching": "POST /run_matching - Start AI matching process",
            "status": "GET /status - Get matching status",
            "health": "GET /health - Health check"
        },
        "model": MODEL_NAME,
        "api_key_configured": bool(api_key)
    }

if __name__ == "__main__":
    print("=" * 70)
    print("AI Matching Service")
    print("=" * 70)
    print(f"Model: {MODEL_NAME}")
    print(f"API Key: {'Configured' if api_key else 'NOT CONFIGURED'}")
    print("\nStarting server on http://0.0.0.0:8001")
    print("Endpoints:")
    print("  - POST /run_matching - Start AI matching")
    print("  - GET /status - Get matching status")
    print("  - GET /health - Health check")
    print("=" * 70)
    
    uvicorn.run(
        "ai_matching_service:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )

