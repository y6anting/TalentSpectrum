from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.connection import create_tables
import os

# Import all routers
from routers import (
    users,
    profiles,
    jobs,
    applications,
    chatbot,
    resume_feedback,
    resume_summary,
    resume_extractor,
    tts,
    mock_interview,
    trainerbook,
    company,
    ai_matching,
    match_result_route,
    bookedAppointments,
    shortlist
)

# Import models so they register with SQLAlchemy
from database.models import users as users_model
from database.models import candidate
from database.models import employer
from database.models import chatbot as chatbot_model
from database.models import mock_interview as mock_interview_model
from database.models import match_result
from database.models import shortlist as shortlist_model

# Initialize FastAPI app
app = FastAPI(
    title="TalentSpectrum API",
    description="Unified backend API for TalentSpectrum - Supporting neurodivergent job seekers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - Enhanced for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Create necessary directories
os.makedirs("audio_outputs", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
os.makedirs("temp", exist_ok=True)

# Logo directory for company logos - match jobs.py path calculation
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # consolidated/
LOGO_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "talent-spectrum-app", "public", "logo"))
PROFILE_PICTURES_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "talent-spectrum-app", "public", "profile-pictures"))
os.makedirs(LOGO_DIR, exist_ok=True)
os.makedirs(PROFILE_PICTURES_DIR, exist_ok=True)

# Mount static files
if os.path.exists("audio_outputs"):
    app.mount("/audio", StaticFiles(directory="audio_outputs"), name="audio")
if os.path.exists(LOGO_DIR):
    app.mount("/logo", StaticFiles(directory=LOGO_DIR), name="logo")
if os.path.exists(PROFILE_PICTURES_DIR):
    app.mount("/profile-pictures", StaticFiles(directory=PROFILE_PICTURES_DIR), name="profile-pictures")

# Create database tables on startup
# @app.on_event("startup")
# async def startup_event():
#     create_tables()
#     print("✅ Database tables created successfully")
#     print("📚 API Documentation: http://localhost:8000/docs")

create_tables()

@app.get("/")
def read_root():
    return {
        "message": "TalentSpectrum Unified API",
        "status": "running",
        "version": "1.0.0",
        "source": "pg_db structure",
        "services": [
            "users (login/register)",
            "profiles",
            "jobs",
            "applications",
            "company",
            "chatbot",
            "resume-feedback",
            "resume-summary",
            "resume-extractor",
            "text-to-speech",
            "mock-interview",
            "trainerbook",
            "ai-matching",
            "match-results"
            
        ],
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "ai_matching_trigger": "/ai-matching/run_matching",
            "ai_matching_status": "/ai-matching/status"
            "appointment"
        }
            
    }

# @app.get("/health")
# def health_check():
#     return {
#         "status": "healthy",
#         "api": "operational"
#     }

# Register all routers (matching pg_db structure)
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(company.router, prefix="/company", tags=["Company"])
app.include_router(chatbot.router, prefix="/chat", tags=["Chatbot"])
app.include_router(resume_feedback.router, prefix="/resume", tags=["Resume Feedback"])
app.include_router(resume_summary.router, prefix="/resume", tags=["Resume Summary"])
app.include_router(resume_extractor.router, prefix="/resume-extractor", tags=["Resume Extractor"])
app.include_router(tts.router, prefix="/tts", tags=["Text-to-Speech"])
app.include_router(mock_interview.router, prefix="/mock-interview", tags=["Mock Interview"])
app.include_router(trainerbook.router, prefix="/trainerbook", tags=["TrainerBook"])
app.include_router(shortlist.router, prefix="/shortlist", tags=["Shortlist"])
app.include_router(ai_matching.router, prefix="/ai-matching", tags=["AI Matching"])
app.include_router(match_result_route.router, prefix="/match_results", tags=["Match Results"])
app.include_router(bookedAppointments.router, prefix="/appointment", tags=["Appointment"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

