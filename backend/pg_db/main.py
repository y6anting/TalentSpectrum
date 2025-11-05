# backend/pg_db/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database.connection import create_tables, engine, Base

# Import models so they register with SQLAlchemy
from database.models import users
from database.models import candidate # <--- UNCOMMENTED THIS LINE

# Import routers
from routers.users import router as users_router
from routers.profiles import router as profiles_router
# from routers.profile_others import router as profile_others_router
from routers.jobs import router as jobs_router
from routers.applications import router as applications_router
# from routers.resume_extract import router as resume_extract_router

# --- Database Initialization ---
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
# app.include_router(profile_others_router, prefix="/profile_others", tags=["profile_others"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(applications_router, prefix="/applications", tags=["applications"])
# app.include_router(resume_extract_router, prefix="/resume", tags=["resume"])