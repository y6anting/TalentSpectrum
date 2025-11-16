from fastapi import APIRouter, Depends, HTTPException, Query
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
async def get_employer_shortlist(
    employer_email: str, 
    db: DbDep, 
    status: str = Query(None, description="Filter by status (e.g., 'shortlisted')")
):
    """
    Get shortlisted candidates for an employer
    If status is provided, filter by that status (e.g., "shortlisted")
    """
    try:
        print(f"Fetching shortlisted candidates for employer: {employer_email}, status filter: {status}")
        query = db.query(ShortlistedCandidate).filter(
            ShortlistedCandidate.employer_email == employer_email
        )
        
        # Filter by status if provided
        if status:
            query = query.filter(ShortlistedCandidate.status == status)
        
        shortlisted = query.order_by(ShortlistedCandidate.created_at.desc()).all()
        
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
        allowed_fields = ['status', 'accommodation_details', 'experience', 'score', 'interview_date']
        for field, value in update_data.items():
            if field in allowed_fields and hasattr(shortlisted, field):
                # Handle interview_date conversion from string to datetime if needed
                if field == 'interview_date' and isinstance(value, str):
                    try:
                        from datetime import datetime
                        value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except (ValueError, AttributeError):
                        # If parsing fails, try other formats
                        try:
                            value = datetime.fromisoformat(value)
                        except ValueError:
                            print(f"Warning: Could not parse interview_date: {value}")
                            continue
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
