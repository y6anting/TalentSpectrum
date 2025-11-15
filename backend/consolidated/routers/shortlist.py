from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List
from datetime import datetime

from database.connection import get_db
from database.models.shortlist import ShortlistedCandidate, ShortlistRequest, ShortlistResponse

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=ShortlistResponse)
async def create_shortlist(db: DbDep, shortlist: ShortlistRequest):
    """
    Create a new shortlisted candidate entry
    """
    try:
        # Check if already shortlisted
        existing = db.query(ShortlistedCandidate).filter(
            ShortlistedCandidate.employer_email == shortlist.employer_email,
            ShortlistedCandidate.candidate_id == shortlist.candidate_id,
            ShortlistedCandidate.job_id == shortlist.job_id
        ).first()

        if existing:
            raise HTTPException(status_code=400, detail="Candidate already shortlisted for this job")

        # Create new shortlist entry
        new_shortlist = ShortlistedCandidate(
            employer_email=shortlist.employer_email,
            candidate_id=shortlist.candidate_id,
            candidate_name=shortlist.candidate_name,
            candidate_email=shortlist.candidate_email,
            job_id=shortlist.job_id,
            job_title=shortlist.job_title,
            applied_date=shortlist.applied_date,
            status=shortlist.status or "shortlisted",
            accommodations_requested=shortlist.accommodations_requested,
            accommodation_details=shortlist.accommodation_details,
            experience=shortlist.experience,
            score=shortlist.score
        )

        db.add(new_shortlist)
        db.commit()
        db.refresh(new_shortlist)

        return new_shortlist

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating shortlist: {str(e)}")


@router.get("/employer/{employer_email}", response_model=List[ShortlistResponse])
async def get_employer_shortlist(employer_email: str, db: DbDep):
    """
    Get all shortlisted candidates for an employer
    """
    try:
        print(f"Fetching shortlisted candidates for employer: {employer_email}")
        shortlisted = db.query(ShortlistedCandidate).filter(
            ShortlistedCandidate.employer_email == employer_email
        ).order_by(ShortlistedCandidate.created_at.desc()).all()
        
        print(f"Found {len(shortlisted)} shortlisted candidates")
        return shortlisted

    except Exception as e:
        print(f"Error fetching shortlist: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching shortlist: {str(e)}")


@router.get("/{shortlist_id}", response_model=ShortlistResponse)
async def get_shortlist_by_id(shortlist_id: int, db: DbDep):
    """
    Get a specific shortlisted candidate by ID
    """
    try:
        shortlisted = db.query(ShortlistedCandidate).filter(
            ShortlistedCandidate.id == shortlist_id
        ).first()

        if not shortlisted:
            raise HTTPException(status_code=404, detail="Shortlisted candidate not found")

        return shortlisted

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching shortlist: {str(e)}")


@router.put("/{shortlist_id}", response_model=ShortlistResponse)
async def update_shortlist(shortlist_id: int, db: DbDep, update_data: dict):
    """
    Update a shortlisted candidate's information (e.g., status change)
    """
    try:
        shortlisted = db.query(ShortlistedCandidate).filter(
            ShortlistedCandidate.id == shortlist_id
        ).first()

        if not shortlisted:
            raise HTTPException(status_code=404, detail="Shortlisted candidate not found")

        # Update allowed fields
        allowed_fields = ['status', 'accommodation_details', 'experience', 'score']
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(shortlisted, field):
                setattr(shortlisted, field, value)

        db.commit()
        db.refresh(shortlisted)

        return shortlisted

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating shortlist: {str(e)}")


@router.delete("/{shortlist_id}")
async def delete_shortlist(shortlist_id: int, db: DbDep):
    """
    Remove a candidate from shortlist
    """
    try:
        shortlisted = db.query(ShortlistedCandidate).filter(
            ShortlistedCandidate.id == shortlist_id
        ).first()

        if not shortlisted:
            raise HTTPException(status_code=404, detail="Shortlisted candidate not found")

        db.delete(shortlisted)
        db.commit()

        return {"message": "Candidate removed from shortlist successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting shortlist: {str(e)}")
