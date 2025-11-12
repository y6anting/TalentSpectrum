from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database.connection import create_tables, engine, Base

# Import models so they register with SQLAlchemy
from database.models import users
from database.models import candidate
from database.models import match_result # <--- NEW: Import the match_result model
from database.models import mock_interview # <--- Import the mock_interview model

# Import routers
from routers.users import router as users_router
from routers.profiles import router as profiles_router
from routers.company import router as company_router
from routers.jobs import router as jobs_router
from routers.applications import router as applications_router
from routers.match_result_route import router as match_results_router # <--- NEW: Import the match_results router
from routers.mock_interview import router as mock_interview_router # <--- Import the mock_interview router

# --- Database Initialization ---
# Ensure this call is made *after* all models (like match_result) are imported
create_tables()

# --- App Initialization ---
app = FastAPI(title="TalentSpectrum DB API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static File Setup for Logos ---
# Define the logo directory (absolute path)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_DIR = os.path.join(BASE_DIR, "logo")

# Make sure directory exists
os.makedirs(LOGO_DIR, exist_ok=True)

# Serve static files (e.g. http://127.0.0.1:8000/logo/gamuda_1762353400.jpg)
app.mount("/logo", StaticFiles(directory=LOGO_DIR), name="logo")

# --- Root Route ---
@app.get("/")
def read_root():
    return {"message": "TalentSpectrum DB API is running."}

# --- Router Registration ---
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(applications_router, prefix="/applications", tags=["applications"])
app.include_router(company_router, prefix="/company", tags=["company"])
app.include_router(match_results_router, prefix="/match_results", tags=["match_results"])
app.include_router(mock_interview_router, tags=["mock-interview"])