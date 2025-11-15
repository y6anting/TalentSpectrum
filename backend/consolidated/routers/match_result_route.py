from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

# Assuming these are the correct relative paths in your project structure
from database.connection import get_db
# IMPORTANT: Update this import to include MatchResultFullResponse
from database.models.match_result import MatchResult, CandidateMatchResultCreate, MatchResultResponse, MatchResultFullResponse


router = APIRouter()


def upsert_match_result(db: Session, match_data: Dict[str, Any]):
    """
    Checks for an existing MatchResult by job_id and candidate_email. 
    If found, updates the row; otherwise, creates a new one.
    
    Returns the MatchResult object and the action taken ('inserted' or 'updated').
    """

    job_id = match_data["job_id"]
    candidate_email = match_data["candidate_summary"]["email"]

    # 1. Define all fields to be inserted/updated
    fields_to_upsert = {
        # Candidate fields
        "candidate_name": match_data["candidate_summary"]["name"],
        "candidate_email": candidate_email,
        "location": match_data["candidate_summary"]["location"],
        "work_type_preference": match_data["candidate_summary"]["work_type_preference"],
        "skills": match_data["candidate_summary"]["skills"],
        "accommodations": match_data["candidate_summary"]["accommodations"],
        "communication_preference": match_data["candidate_summary"]["communication_preference"],

        # Job/Company fields
        "job_id": job_id,
        "job_title": match_data["job_title"],
        "company_name": match_data["company_name"],
        "company_email": match_data["employer_email"],
        "company_id": match_data["company_id"],

        # Score Fields
        "primary_score": match_data["primary_score"],
        "secondary_score": match_data["secondary_score"],
        "tertiary_score": match_data["tertiary_score"],
        "total_score": match_data["total_score"],

        # Analysis Fields
        "primary_matched": match_data["primary_analysis"]["matched"],
        "primary_consider": match_data["primary_analysis"]["consider"],
        "primary_ai_recommendation": match_data["primary_analysis"]["ai_recommendation"],

        "secondary_matched": match_data["secondary_analysis"]["matched"],
        "secondary_consider": match_data["secondary_analysis"]["consider"],
        "secondary_ai_recommendation": match_data["secondary_analysis"]["ai_recommendation"],

        "tertiary_matched": match_data["tertiary_analysis"]["matched"],
        "tertiary_consider": match_data["tertiary_analysis"]["consider"],
        "tertiary_ai_recommendation": match_data["tertiary_analysis"]["ai_recommendation"],
    }

    # 2. Check for existing record based on job_id and candidate_email
    existing_match = db.query(MatchResult).filter(
        MatchResult.job_id == job_id,
        MatchResult.candidate_email == candidate_email
    ).first()

    if existing_match:
        # 3. Update existing record
        for key, value in fields_to_upsert.items():
            setattr(existing_match, key, value)
        db.flush()
        return existing_match, "updated"
    else:
        # 4. Insert new record
        new_match = MatchResult(**fields_to_upsert)
        db.add(new_match)
        db.flush() # Flush to get the ID before commit
        return new_match, "inserted"


@router.post("/store_results",
             response_model=Dict[str, Any],
             status_code=status.HTTP_201_CREATED,
             summary="Store all AI match results for one candidate (Upsert logic used).")
async def create_match_results(
    candidate_match_result: CandidateMatchResultCreate,
    db: Session = Depends(get_db)
):
    """
    Receives a CandidateMatchResultCreate payload and checks for an existing 
    match based on job_id and candidate_email. Updates the existing record or 
    inserts a new one.
    """

    inserted_count = 0
    updated_count = 0
    errors = []

    # Extract candidate summary details once
    candidate_summary = candidate_match_result.candidate_summary.dict()

    for match in candidate_match_result.matches:
        try:
            # Create a combined dictionary for the upsert function
            match_data = {
                "candidate_summary": candidate_summary,
                **match.dict() # Unpack match details
            }

            # Use the upsert logic
            _, action = upsert_match_result(db, match_data)
            
            if action == "inserted":
                inserted_count += 1
            elif action == "updated":
                updated_count += 1
                
        except Exception as e:
            db.rollback()
            errors.append({
                "job_id": match.job_id,
                "error": f"Failed to save/update match: {e}"
            })

    if errors:
        # If any errors occurred, the transaction is rolled back by SQLAlchemy, 
        # but we can report the partial success count.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": f"Successfully processed {inserted_count + updated_count} matches but encountered {len(errors)} errors.",
                "errors": errors
            }
        )

    db.commit()

    return {
        "message": f"Successfully processed match results for candidate {candidate_match_result.candidate_name}.",
        "inserted_count": inserted_count,
        "updated_count": updated_count
    }


# MODIFIED: /all_results endpoint to return full data
@router.get("/all_results", response_model=List[MatchResultFullResponse], summary="Retrieve all stored match results (full data).")
async def get_all_match_results(db: Session = Depends(get_db)):
    """Retrieves a complete list of all match results from the database."""
    try:
        return db.query(MatchResult).all()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve all match results: {e}")


# NEW: Endpoint to get all match results for a specific job_id
@router.get("/all_results/{job_id}", response_model=List[MatchResultFullResponse], summary="Retrieve all stored match results for a specific job ID (full data).")
async def get_match_results_by_job_id(job_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a complete list of all match results from the database
    for a given job ID.
    """
    try:
        results = db.query(MatchResult).filter(MatchResult.job_id == job_id).all()
        if not results:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No match results found for job ID: {job_id}")
        return results
    except HTTPException as e:
        raise e # Re-raise HTTPExceptions
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve match results for job ID {job_id}: {e}")


# NEW: Endpoint to get all match results for a specific candidate email
@router.get("/candidate/{candidate_email}", response_model=List[MatchResultFullResponse], summary="Retrieve all stored match results for a specific candidate (full data).")
async def get_match_results_by_candidate_email(candidate_email: str, db: Session = Depends(get_db)):
    """
    Retrieves a complete list of all match results from the database
    for a given candidate email.
    """
    try:
        results = db.query(MatchResult).filter(MatchResult.candidate_email == candidate_email).all()
        # Don't raise 404 if no results found - just return empty list
        # This allows frontend to gracefully handle "no matches yet" scenario
        return results
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve match results for candidate {candidate_email}: {e}")
