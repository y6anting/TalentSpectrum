# backend/pg_db/routers/mock_interview.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models.mock_interview import (
    MockInterviewReport, 
    MockInterviewReportRequest, 
    MockInterviewReportResponse
)
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/mock-interview", tags=["mock-interview"])

@router.post("/reports", response_model=MockInterviewReportResponse)
def create_mock_interview_report(
    report: MockInterviewReportRequest,
    db: Session = Depends(get_db)
):
    """Create a new mock interview report"""
    try:
        db_report = MockInterviewReport(
            candidate_email=report.candidate_email,
            position_title=report.position_title,
            position_level=report.position_level,
            interview_type=report.interview_type,
            total_questions=report.total_questions,
            start_time=report.start_time,
            end_time=report.end_time,
            duration_seconds=report.duration_seconds,
            overall_score=report.overall_score,
            clarity_score=report.clarity_score,
            relevance_score=report.relevance_score,
            completeness_score=report.completeness_score,
            overall_feedback=report.overall_feedback,
            strengths=[s for s in report.strengths] if report.strengths else [],
            improvements=[i for i in report.improvements] if report.improvements else [],
            questions_data=[q.dict() for q in report.questions_data] if report.questions_data else []
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return db_report
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating mock interview report: {str(e)}")

@router.get("/reports/{candidate_email}", response_model=List[MockInterviewReportResponse])
def get_candidate_mock_interview_reports(
    candidate_email: str,
    db: Session = Depends(get_db)
):
    """Get all mock interview reports for a candidate"""
    try:
        reports = db.query(MockInterviewReport).filter(
            MockInterviewReport.candidate_email == candidate_email
        ).order_by(MockInterviewReport.created_at.desc()).all()
        
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching mock interview reports: {str(e)}")

@router.get("/reports/{candidate_email}/latest", response_model=MockInterviewReportResponse)
def get_latest_mock_interview_report(
    candidate_email: str,
    db: Session = Depends(get_db)
):
    """Get the latest mock interview report for a candidate"""
    try:
        report = db.query(MockInterviewReport).filter(
            MockInterviewReport.candidate_email == candidate_email
        ).order_by(MockInterviewReport.created_at.desc()).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="No mock interview reports found for this candidate")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching latest mock interview report: {str(e)}")

@router.get("/reports/detail/{report_id}", response_model=MockInterviewReportResponse)
def get_mock_interview_report_by_id(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific mock interview report by ID"""
    try:
        report = db.query(MockInterviewReport).filter(
            MockInterviewReport.id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Mock interview report not found")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching mock interview report: {str(e)}")

@router.delete("/reports/{report_id}")
def delete_mock_interview_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Delete a mock interview report"""
    try:
        report = db.query(MockInterviewReport).filter(
            MockInterviewReport.id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Mock interview report not found")
        
        db.delete(report)
        db.commit()
        
        return {"message": "Mock interview report deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting mock interview report: {str(e)}")
