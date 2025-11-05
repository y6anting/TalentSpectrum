# backend/pg_db/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import create_tables, engine, Base # Keep Base here for clarity, though not strictly used directly

# Import ALL model modules here.
# This ensures that all models inheriting from Base are registered with Base.metadata
# before create_tables() is called.
from database.models import users # <--- CHANGE THIS LINE: Import the module, not the class directly
# from database.models import candidate # If you had other models, import their modules here
# from database.models import employer # If you had other models, import their modules here

# Import routers
from routers.users import router as users_router
from routers.profiles import router as profiles_router
# from routers.profile_others import router as profile_others_router
from routers.jobs import router as jobs_router
from routers.applications import router as applications_router
# from routers.resume_extract import router as resume_extract_router

# Create DB tables
# This call will now correctly find all models that inherited from Base
# because their modules (like users.py) have already been imported above.
create_tables()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "TalentSpectrum DB API"}

# Register routers
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(profiles_router, prefix="/profiles")
# app.include_router(profile_others_router, prefix="/profile_others", tags=["profile_others"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(applications_router, prefix="/applications", tags=["applications"])
# app.include_router(resume_extract_router, prefix="/resume", tags=["resume"])