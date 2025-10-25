from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import create_tables, engine, Base

# Import models so tables are registered to Base metadata
# from database.models.candidate import User, CandidateProfile
from database.models.employer import Post_Job

# Import routers
# from routers.users import router as users_router
# from routers.profiles import router as profiles_router
# from routers.profile_others import router as profile_others_router
from routers.jobs import router as jobs_router
from routers.candidate import router as candidate_router

# Create DB tables
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

# Register routers (following backend/be style)
# app.include_router(users_router, prefix="/users", tags=["users"])
# app.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
# app.include_router(profile_others_router, prefix="/profile_others", tags=["profile_others"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(candidate_router, prefix="/candidate", tags=["candidate"])
