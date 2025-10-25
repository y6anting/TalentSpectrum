from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from typing import List

from database.models.profile import User, UserBase, UserSchema, UserListResponse

router = APIRouter()

@router.get("/", response_model=UserListResponse)
def user_list(session: Session = Depends(get_db)):
    try:
        users = session.query(User).all()
        if users:
            [print(f"Found user: {user.name}") for user in users]
            
            return {"users": [UserSchema.model_validate(user).model_dump() for user in users]}
        else:
            return {"message": "No users found", "users": []}
    except Exception as e:
        print(f"Error retrieving users: {str(e)}")
        return {"error": "Failed to retrieve users", "details": str(e)}
    

@router.post("/add")
def user_add(user_data: UserBase, session: Session = Depends(get_db)):
    try:
        if hasattr(user_data, 'model_dump'):
            user_dict = user_data.model_dump(exclude_unset=True)
        
        new_user = User(**user_dict)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        print(f"Added user with ID: {new_user.id}")
        
        user_response = UserSchema.model_validate(new_user).model_dump()
        return {
            "status": "success",
            "message": f"User created successfully",
            "data": user_response
        }
    except Exception as e:
        session.rollback()
        error_message = str(e)
        print(f"Unexpected error: {error_message}")
        
        return {
            "status": "error",
            "message": "An unexpected error occurred",
            "detail": error_message
        }