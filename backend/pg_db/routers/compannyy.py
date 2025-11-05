# backend/pg_db/routers/jobs.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

from database.connection import get_db
from database.models.employer import Post_Job, PostJobRequest, Company, CompanyRequest
# from database.models.job import PostJobRequest

router = APIRouter()

DbDep = Annotated[Session, Depends(get_db)]

# Company endpoints
@router.get("/company/{email}")
async def get_company_by_email(email: str, db: DbDep):
    company = db.query(Company).filter(Company.email == email).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/company/")
async def create_company(db: DbDep, company: CompanyRequest):
    try:
        # Check if company already exists
        existing = db.query(Company).filter(Company.email == company.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Company with this email already exists")
        
        new_company = Company(**company.dict())
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        return {"message": "Company created", "company": new_company}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating company: {e}")

@router.put("/company/{email}")
async def update_company(email: str, db: DbDep, company: CompanyRequest):
    existing = db.query(Company).filter(Company.email == email).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    
    for key, value in company.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return {"message": "Company updated", "company": existing}

@router.post("/company/{email}/upload-logo")
async def upload_company_logo(
    email: str,
    file: UploadFile = File(...),
    db: DbDep = Depends(get_db)
):
    # 1. Check if company exists
    company_profile = db.query(Company).filter(Company.email == email).first()
    if not company_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found for this email.")

    # 2. Validate file type (optional but highly recommended)
    allowed_extensions = ["jpg", "jpeg", "png", "gif", "svg"]
    # Ensure file.filename is not None before splitting
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")
        
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )

    # 3. Generate unique filename: companyName_timestamp.extension
    # Ensure company_profile.name is not None before sanitizing
    if not company_profile.name:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Company name is missing for profile.")

    sanitized_company_name = sanitize_filename(company_profile.name)
    timestamp = int(datetime.now().timestamp())
    new_filename = f"{sanitized_company_name}_{timestamp}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, new_filename)

    # 4. Save the file to the specified folder
    try:
        # Create the directory if it doesn't exist (redundant if os.makedirs is called at app start, but safe)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not save file: {e}")

    # 5. Construct logo_url (relative path for serving)
    # This URL should be accessible from the frontend.
    # If your FastAPI app serves static files from /backend/logo, then /logo/filename is correct.
    logo_url = f"/logo/{new_filename}"

    # 6. Update the company's logo_url in the database
    company_profile.logo_url = logo_url
    db.commit()
    db.refresh(company_profile)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logo uploaded successfully", "logo_url": logo_url}
    )