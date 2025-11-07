import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- Load environment variables from .env file ---
# Resolve the path to the .env file.
# It's assumed that .env is in the same directory as main.py,
# which is one level up from database/connection.py
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, '..', '.env') # Go up one level to find .env

if not os.path.exists(dotenv_path):
    print(f"Warning: .env file not found at {dotenv_path}. Attempting to use system environment variables.")
else:
    load_dotenv(dotenv_path)

# --- Construct DATABASE_URL from environment variables ---
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

# Basic validation for critical connection parameters
if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
    raise ValueError(
        "One or more database environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME) "
        "are not set. Please check your .env file or system environment."
    )

# DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# --- SQLAlchemy setup ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def create_tables():
    # Import all models here so that Base.metadata knows about them
    from database.models.users import LoginUser
    # from database.models.candidate import Profile, Profile_Others
    # from database.models.employer import Post_Job
    
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()