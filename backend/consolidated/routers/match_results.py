from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models.match_result import (
    MatchResult, 
    CandidateMatchResultCreate, 
    MatchResultResponse,
    MatchResultListResponse
)
from typing import List, Optional

router = APIRouter()


@router.post("/store_results", response_model=dict)
def store_match_results(
    payload: CandidateMatchResultCreate,
    db: Session = Depends(get_db)
):
    """
    Store AI matching results for a single candidate against multiple jobs.
    
    Expects payload with:
    - candidate_id, candidate_name, candidate_summary
    - matches: List of job match data with scores and analysis
    """
    
    try:
        stored_count = 0
        
        # Extract candidate summary email for storage
        candidate_email = payload.candidate_summary.email
        
        # Iterate through all matches for this candidate
        for match in payload.matches:
            # Create a new MatchResult entry for each job match
            match_result = MatchResult(
                candidate_id=payload.candidate_id,
                candidate_name=payload.candidate_name,
                candidate_email=candidate_email,
                job_id=match.job_id,
                job_title=match.job_title,
                company_name=match.company_name,
                company_id=match.company_id,
                employer_email=match.employer_email,
                primary_score=match.primary_score,
                secondary_score=match.secondary_score,
                tertiary_score=match.tertiary_score,
                total_score=match.total_score,
                # Store analysis objects as JSON
                primary_analysis=match.primary_analysis.dict(),
                secondary_analysis=match.secondary_analysis.dict(),
                tertiary_analysis=match.tertiary_analysis.dict(),
            )
            
            db.add(match_result)
            stored_count += 1
        
        # Commit all matches at once
        db.commit()
        
        return {
            "message": f"Successfully stored {stored_count} match results for candidate {payload.candidate_name}",
            "candidate_id": payload.candidate_id,
            "matches_stored": stored_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error storing match results: {str(e)}")


@router.get("/candidate/{candidate_id}", response_model=MatchResultListResponse)
def get_candidate_matches(
    candidate_id: str,
    db: Session = Depends(get_db),
    limit: Optional[int] = 100,
    offset: Optional[int] = 0
):
    """
    Retrieve all match results for a specific candidate.
    
    Returns matches ordered by total_score (highest first).
    """
    
    try:
        # Query all matches for the candidate
        matches = db.query(MatchResult).filter(
            MatchResult.candidate_id == candidate_id
        ).order_by(
            MatchResult.total_score.desc()
        ).offset(offset).limit(limit).all()
        
        total_count = db.query(MatchResult).filter(
            MatchResult.candidate_id == candidate_id
        ).count()
        
        return MatchResultListResponse(
            results=matches,
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving matches: {str(e)}")


@router.get("/candidate/email/{email}", response_model=MatchResultListResponse)
def get_candidate_matches_by_email(
    email: str,
    db: Session = Depends(get_db),
    limit: Optional[int] = 100,
    offset: Optional[int] = 0
):
    """
    Retrieve all match results for a candidate by email.
    
    Returns matches ordered by total_score (highest first).
    """
    
    try:
        # Query all matches for the candidate email
        matches = db.query(MatchResult).filter(
            MatchResult.candidate_email == email
        ).order_by(
            MatchResult.total_score.desc()
        ).offset(offset).limit(limit).all()
        
        total_count = db.query(MatchResult).filter(
            MatchResult.candidate_email == email
        ).count()
        
        return MatchResultListResponse(
            results=matches,
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving matches: {str(e)}")


@router.get("/job/{job_id}", response_model=MatchResultListResponse)
def get_job_matches(
    job_id: int,
    db: Session = Depends(get_db),
    limit: Optional[int] = 100,
    offset: Optional[int] = 0
):
    """
    Retrieve all match results for a specific job.
    
    Returns matches ordered by total_score (highest first).
    """
    
    try:
        # Query all matches for the job
        matches = db.query(MatchResult).filter(
            MatchResult.job_id == job_id
        ).order_by(
            MatchResult.total_score.desc()
        ).offset(offset).limit(limit).all()
        
        total_count = db.query(MatchResult).filter(
            MatchResult.job_id == job_id
        ).count()
        
        return MatchResultListResponse(
            results=matches,
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving matches: {str(e)}")


@router.get("/company/{company_id}", response_model=MatchResultListResponse)
def get_company_matches(
    company_id: int,
    db: Session = Depends(get_db),
    limit: Optional[int] = 100,
    offset: Optional[int] = 0
):
    """
    Retrieve all match results for a specific company.
    
    Returns matches ordered by total_score (highest first).
    """
    
    try:
        # Query all matches for the company
        matches = db.query(MatchResult).filter(
            MatchResult.company_id == company_id
        ).order_by(
            MatchResult.total_score.desc()
        ).offset(offset).limit(limit).all()
        
        total_count = db.query(MatchResult).filter(
            MatchResult.company_id == company_id
        ).count()
        
        return MatchResultListResponse(
            results=matches,
            total_count=total_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving matches: {str(e)}")


@router.delete("/{match_id}", response_model=dict)
def delete_match_result(
    match_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a specific match result by ID.
    """
    
    try:
        match = db.query(MatchResult).filter(MatchResult.id == match_id).first()
        
        if not match:
            raise HTTPException(status_code=404, detail="Match result not found")
        
        db.delete(match)
        db.commit()
        
        return {"message": f"Match result {match_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting match result: {str(e)}")


@router.delete("/candidate/{candidate_id}", response_model=dict)
def delete_candidate_matches(
    candidate_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete all match results for a specific candidate.
    """
    
    try:
        deleted_count = db.query(MatchResult).filter(
            MatchResult.candidate_id == candidate_id
        ).delete()
        
        db.commit()
        
        return {
            "message": f"Deleted {deleted_count} match results for candidate {candidate_id}",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting matches: {str(e)}")
