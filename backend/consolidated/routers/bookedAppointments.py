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

@router.get("/")
async def get_appointment_all(db: DbDep):
    return db.query(Appointment).all()

@router.get("/{jobCoach}+{dateTime}")
async def get_appointment_by_coach_and_time(jobCoach: str, dateTime: datetime, db: DbDep):
    appointment = db.query(Appointment).filter(
        (Appointment.jobCoach == jobCoach) 
        & (Appointment.dateTime == dateTime)
    ).first()
    if appointment is not None:
        return appointment
    
    raise HTTPException(status_code= 404, detail= "Appointment not found")

# @router.get("/{candidate}")

# @router.get("/")
# async def get_all_unbooked_appointments(db: DbDep)

@router.post("/")
async def new_appointment(new_app: AppointmentCreate, db: DbDep):
    try:
        new_appointment = Appointment(
            jobCoach=new_app.jobCoach,
            dateTime=new_app.dateTime,
        )
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        return {"message": "Appointment booked successfully", "id": new_appointment.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating appointment: {e}")

# @router.put("/book")
# async def book_appointment(id: int, candidate: str, db:DbDep)

@router.delete("/{id}")
async def delete_appointment(id: int, db: DbDep):
    appointment = db.query(Appointment).filter(Appointment.id == id).first()

    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}