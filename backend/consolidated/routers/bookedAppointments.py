from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import datetime, timedelta

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
    
    # Check if appointment is already booked
    if appointment.candidate is not None:
        raise HTTPException(status_code= 400, detail= "Appointment is already booked")
    
    # Check if candidate already has an appointment with the same coach
    existing_appointment = db.query(Appointment).filter(
        (Appointment.jobCoach == appointment.jobCoach) &
        (Appointment.candidate == candidate) &
        (Appointment.id != id)
    ).first()
    
    if existing_appointment:
        raise HTTPException(
            status_code= 400, 
            detail= f"You already have a booked appointment with this coach. Please cancel your existing appointment first."
        )
    
    # Check for time conflicts (overlapping appointments) - allow 1 hour buffer
    appointment_start = appointment.dateTime
    appointment_end = appointment_start + timedelta(hours=1)  # Assume 1 hour duration
    
    # Find any appointments that overlap with this time slot
    # An appointment overlaps if:
    # - It starts before this appointment ends AND
    # - It ends (or would end) after this appointment starts
    conflicting_appointments = db.query(Appointment).filter(
        (Appointment.candidate == candidate) &
        (Appointment.id != id) &
        (Appointment.dateTime < appointment_end)
    ).all()
    
    # Check each appointment for overlap
    for existing_apt in conflicting_appointments:
        existing_start = existing_apt.dateTime
        existing_end = existing_start + timedelta(hours=1)  # Assume 1 hour duration
        
        # Check if appointments overlap
        if existing_start < appointment_end and existing_end > appointment_start:
            raise HTTPException(
                status_code= 400,
                detail= f"You have a conflicting appointment at {existing_apt.dateTime.strftime('%Y-%m-%d %H:%M')}. Please choose a different time."
            )
    
    appointment.candidate = candidate
    db.add(appointment)
    db.commit()
    return {"message": f"Appointment booked by {candidate}"}

@router.put("/unbook")
async def book_appointment(id: int, db:DbDep):
    appointment = db.query(Appointment).filter(
        (Appointment.id == id) 
    ).first()
    if appointment is None:
        raise HTTPException(status_code= 404, detail= "Appointment not found")
    appointment.candidate = None
    db.add(appointment)
    db.commit()
    return {"message": f"Appointment unbooked"}

@router.delete("/{id}")
async def delete_appointment(id: int, db: DbDep):
    appointment = db.query(Appointment).filter(Appointment.id == id).first()

    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}