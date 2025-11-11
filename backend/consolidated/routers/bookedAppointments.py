from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import datetime
import os
import shutil
import re

from database.connection import get_db
from database.models.appointment import Appointment

class AppointmentCreate(BaseModel):
    jobCoach: str
    dateTime: datetime

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

@router.get("/all")
async def get_appointment_all(db: DbDep):
    return db.query(Appointment).all()

@router.get("/{jobCoach}")
async def get_unbooked_appointments_by_coach(jobCoach: str, db: DbDep):
    appointment = db.query(Appointment).filter(
        (Appointment.jobCoach == jobCoach)
        & (Appointment.candidate.is_(None))
    ).all()
    if appointment is not None:
        return appointment
    
    raise HTTPException(status_code= 404, detail= "Appointment not found")

@router.get("/booked/{candidate}")
async def get_appointments_from_candidate(candidate: str, db: DbDep):
    appointments = (
        db.query(Appointment)
        .filter(Appointment.candidate == candidate)
        .all()
    )

    if not appointments:
        raise HTTPException(status_code=404, detail="No appointments found for this candidate")

    return appointments

@router.post("/")
async def new_appointment(new_app: AppointmentCreate, db: DbDep):
    try:
        appointment = Appointment(
            jobCoach=new_app.jobCoach,
            dateTime=new_app.dateTime,
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        return {"message": "Appointment booked successfully", "id": appointment.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating appointment: {e}")

@router.put("/book")
async def book_appointment(id: int, candidate: str, db:DbDep):
    appointment = db.query(Appointment).filter(
        (Appointment.id == id) 
    ).first()
    if appointment is None:
        raise HTTPException(status_code= 404, detail= "Appointment not found")
    appointment.candidate = candidate
    db.add(appointment)
    db.commit()
    return {"message": f"Appointment booked by {candidate}"}

@router.delete("/{id}")
async def delete_appointment(id: int, db: DbDep):
    appointment = db.query(Appointment).filter(Appointment.id == id).first()

    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}