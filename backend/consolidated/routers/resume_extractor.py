# backend/consolidated/routers/resume_extractor.py
# Resume PDF parser using Google Gemini (no langchain)

import os
import hashlib
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, UploadFile, HTTPException
from pypdf import PdfReader
from dotenv import load_dotenv
import google.generativeai as genai
import json
from pydantic import BaseModel, Field
from pydantic.json import pydantic_encoder
# Import for profile creation
from routers.profiles import create_profile
from database.models.candidate import CandidateProfileRequest
from database.connection import get_db
from sqlalchemy.orm import Session

# Pydantic Models for Resume Data
class Preferences(BaseModel):
    workType: Optional[str] = ""
    communication: Optional[str] = ""
    schedule: Optional[str] = ""

class PersonalIdentifiers(BaseModel):
    fullName: Optional[str] = ""
    nric: Optional[str] = ""
    emailAddress: Optional[str] = ""
    phoneNumber: Optional[str] = ""
    residentialAddress: Optional[str] = ""
    dateOfBirth: Optional[str] = ""
    gender: Optional[str] = ""
    nationality: Optional[str] = ""
    oku_card: Optional[str] = ""
    preferred_role: Optional[str] = ""
    preferred_industry: Optional[str] = ""
    preferred_location: Optional[str] = ""

class Education(BaseModel):
    level: Optional[str] = ""
    fieldOfStudy: Optional[str] = ""
    institution: Optional[str] = ""
    graduationYear: Optional[int] = 0
    cgpa_grade: Optional[str] = ""
    award: Optional[str] = ""

class Experience(BaseModel):
    employer: Optional[str] = ""
    industry: Optional[str] = ""
    start: Optional[str] = ""
    end: Optional[str] = ""
    isCurrent: Optional[str] = ""
    Title: Optional[str] = ""
    YearsInRole: Optional[str] = ""
    SeniorityLevel: Optional[str] = ""
    SkillsToolsUsed: Optional[str] = ""
    ProjectHighlights: Optional[str] = ""
    HardSkills: Optional[str] = ""
    SoftSkills: Optional[str] = ""
    LanguageProficiency: Optional[str] = ""
    TechnicalKeywords: Optional[str] = ""
    Achievements: Optional[str] = ""

class Skills(BaseModel):
    HardSkills: List[str] = Field(default_factory=list)
    SoftSkills: List[str] = Field(default_factory=list)

class LanguageProficiency(BaseModel):
    language: Optional[str] = ""
    reading: Optional[str] = ""
    writing: Optional[str] = ""
    listening: Optional[str] = ""
    speaking: Optional[str] = ""

class Environment(BaseModel):
    patternRecognition: Optional[str] = ""
    attention: Optional[str] = ""
    systematicThinking: Optional[str] = ""
    bigVsDetail: Optional[str] = ""
    taskSwitching: Optional[str] = ""
    hyperfocus: Optional[str] = ""
    communicationMedium: Optional[str] = ""
    clarity: Optional[str] = ""
    teamStyle: Optional[str] = ""
    presentationComfort: Optional[str] = ""
    checkIns: Optional[str] = ""
    jobCoach: Optional[str] = ""
    auditory: Optional[str] = ""
    visual: Optional[str] = ""
    workspace: Optional[str] = ""
    workdayStructure: Optional[str] = ""

class NeurodivergentStrengths(BaseModel):
    strengths: List[str] = Field(default_factory=list)

class ResumeData(BaseModel):
    name: Optional[str] = ""
    candidate_email: Optional[str] = ""
    dateOfBirth: Optional[str] = ""
    location: Optional[str] = ""
    profile_completion: int
    accommodations: List[str] = Field(default_factory=list)
    preferences: Preferences
    personal_identifiers: PersonalIdentifiers
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    skills: Skills
    language_proficiencies: List[LanguageProficiency] = Field(default_factory=list)
    environment: Environment
    neurodivergent_strengths: NeurodivergentStrengths
    applications: List = Field(default_factory=list)
    saved_jobs: List = Field(default_factory=list)

class UploadPDFResponse(BaseModel):
    status: Optional[str] = ""
    parsed_info: ResumeData
    candidate_id: Optional[str] = ""
    resume_hash: Optional[str] = ""
    file_metadata: dict

router = APIRouter()

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

# Initialize Gemini if API key is available
gemini_model = None
if api_key:
    try:
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        print("✅ Google Gemini initialized for resume extraction")
    except Exception as e:
        print(f"⚠️ Warning: Failed to initialize Gemini: {e}")
        gemini_model = None
else:
    print("⚠️ Warning: GOOGLE_API_KEY/GEMINI_API_KEY not found. Resume extraction will use fallback responses.")

PDFS_DIR = "uploads/resumes"
os.makedirs(PDFS_DIR, exist_ok=True)

# ==========================
# Template
# ==========================
TEMPLATE = """ 
You are a resume parser. Extract all relevant data from the resume text below and output **strictly in JSON** following this schema. 

The output must be compatible with the following model:

{{
  "name": str,
  "candidate_email": str,
  "dateOfBirth": Optional[str],
  "location": Optional[str],
  "profile_completion": int,
  "accommodations": [str],
  "preferences": {{
    "workType": Optional[str],
    "communication": Optional[str],
    "schedule": Optional[str]
  }},
  "personal_identifiers": {{
    "fullName": str,
    "nric": Optional[str],
    "emailAddress": str,
    "phoneNumber": str,
    "residentialAddress": str,
    "dateOfBirth": str,
    "gender": str,
    "nationality": str,
    "oku_card": Optional[str],
    "preferred_role": Optional[str],
    "preferred_industry": Optional[str],
    "preferred_location": Optional[str]
  }},
  "education": [
    {{
      "level": Optional[str],
      "fieldOfStudy": Optional[str],
      "institution": Optional[str],
      "graduationYear": Optional[int],
      "cgpa_grade": Optional[str],
      "award": Optional[str]
    }}
  ],
  "experience": [
    {{
      "employer": Optional[str],
      "industry": Optional[str],
      "start": Optional[str],
      "end": Optional[str],
      "isCurrent": Optional[str],
      "Title": Optional[str],
      "YearsInRole": Optional[str],
      "SeniorityLevel": Optional[str],
      "SkillsToolsUsed": Optional[str],
      "ProjectHighlights": Optional[str],
      "HardSkills": Optional[str],
      "SoftSkills": Optional[str],
      "LanguageProficiency": Optional[str],
      "TechnicalKeywords": Optional[str],
      "Achievements": Optional[str]
    }}
  ],
  "skills": {{
    "HardSkills": [str],
    "SoftSkills": [str]
  }},
  "language_proficiencies": [
    {{
      "language": str,
      "reading": str,
      "writing": str,
      "listening": str,
      "speaking": str
    }}
  ],
  "environment": {{
    "patternRecognition": Optional[str],
    "attention": Optional[str],
    "systematicThinking": Optional[str],
    "bigVsDetail": Optional[str],
    "taskSwitching": Optional[str],
    "hyperfocus": Optional[str],
    "communicationMedium": Optional[str],
    "clarity": Optional[str],
    "teamStyle": Optional[str],
    "presentationComfort": Optional[str],
    "checkIns": Optional[str],
    "jobCoach": Optional[str],
    "auditory": Optional[str],
    "visual": Optional[str],
    "workspace": Optional[str],
    "workdayStructure": Optional[str]
  }},
  "neurodivergent_strengths": {{
    "strengths": [str]
  }},
  "applications": [],
  "saved_jobs": []
}}

Parsing instructions:
1. Extract all relevant data explicitly stated in the resume.
2. Infer missing but logically deducible data (e.g., nationality from address, gender from pronouns).
3. If **date of birth is not provided but NRIC is available**, derive it from the **first 6 digits of the NRIC (YYMMDD)**:
   - Convert it to **YYYY-MM-DD** format.
   - If YY ≥ current year's last two digits, assume **19YY**; otherwise, assume **20YY**.
   - For example:
     - `890525-02-5532` → `1989-05-25`
     - `050412-10-5432` → `2005-04-12`
4. Place the derived `dateOfBirth` field **right after `candidate_email`** in the top-level JSON.
5. In the **education** section:
   - Restrict `"level"` strictly to one of the following:
     ["PT3", "SPM / O-level", "STPM / A-level / Diploma", "Degree", "Master", "PhD", "Vocational", "Professional Certificate"]  
     If unclassifiable, leave it empty.
   - Ensure `"graduationYear"` is between 1990 and 2025 (inclusive). If outside, leave it empty.
6. In the **experience** section:
   - If the candidate is **still working**, set `"end": ""` and `"isCurrent": "true"`.
   - Otherwise, `"isCurrent": "false"`.
   - Force `"SeniorityLevel"` to one of:
     ["Non-executive", "Executive", "Managerial", "Head of Department", "C-suite"].  
     If unclassifiable, leave it empty.
7. In the **language_proficiencies** section:
   - Normalize the `"language"` field as follows:
     - If the provided language is `"Mandarin"`, convert it to `"Chinese"`.
     - Otherwise, restrict `"language"` to one of:
       ["Arabic", "Bengali", "Chinese", "English", "French", "German", "Hindi", "Indonesian", "Italian", "Japanese", "Korean", "Malay", "Portuguese", "Russian", "Spanish", "Tamil", "Thai", "Turkish", "Vietnamese"].
     - If the language is not in this list, set it as `"Other"`.
   - Force `"reading"`, `"writing"`, `"listening"`, and `"speaking"` to one of:
     ["Expert", "Intermediate", "Beginner"].  
     If unclassifiable, leave it empty.
8. Normalize all date values to ISO format (`YYYY-MM` or `YYYY-MM-DD`).
9. Lists must contain distinct elements (no duplicates).
10. Ensure phone numbers and emails are cleanly formatted.
11. Output must be a single valid JSON object only — no markdown, commentary, or explanations.

Resume text:
{context}
"""

@router.post("/upload_pdf", response_model=UploadPDFResponse)
async def upload_pdf(file: UploadFile):
    """Upload, parse resume PDF using Gemini."""
    try:
        if not gemini_model:
            return UploadPDFResponse(
                status="error",
                parsed_info=ResumeData(
                    name="",
                    candidate_email="",
                    profile_completion=0,
                    preferences=Preferences(),
                    personal_identifiers=PersonalIdentifiers(
                        fullName="",
                        emailAddress="",
                        phoneNumber="",
                        residentialAddress="",
                        dateOfBirth="",
                        gender="",
                        nationality=""
                    ),
                    skills=Skills(),
                    environment=Environment(),
                    neurodivergent_strengths=NeurodivergentStrengths()
                ),
                candidate_id="",
                resume_hash="",
                file_metadata={}
            )

        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        # Ensure directory exists
        os.makedirs(PDFS_DIR, exist_ok=True)

        # Save file
        filepath = os.path.join(PDFS_DIR, file.filename)
        with open(filepath, "wb") as f:
            f.write(await file.read())

        # Extract text from PDF
        reader = PdfReader(filepath)
        text = "\n\n".join([p.extract_text() or "" for p in reader.pages])
        if not text.strip():
            return {"status": "error", "message": "No extractable text found."}

        # Metadata
        candidate_id = hashlib.md5(file.filename.encode()).hexdigest()[:8]
        file_metadata = {
            "creation_date": datetime.now().isoformat(),
            "last_modified": datetime.now().isoformat(),
        }
        resume_hash = hashlib.sha256(text.encode()).hexdigest()[:16]

        # Create prompt
        prompt = TEMPLATE.replace("{context}", text)

        # Generate response with safety settings
        try:
            from google.generativeai.types import HarmCategory, HarmBlockThreshold
            
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
            
            response = gemini_model.generate_content(
                prompt,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked
            if not response or not response.text:
                if hasattr(response, 'prompt_feedback'):
                    print(f"⚠️ Gemini blocked response: {response.prompt_feedback}")
                raise Exception("Gemini did not return a valid response. The content may have been blocked.")
            
            parsed_text = response.text
        except Exception as gemini_error:
            print(f"❌ Gemini API error: {gemini_error}")
            raise Exception(f"AI processing failed: {str(gemini_error)}")

        # Clean up JSON if wrapped in markdown
        parsed_clean = parsed_text.strip()
        if parsed_clean.startswith("```json"):
            parsed_clean = parsed_clean[7:]
        if parsed_clean.startswith("```"):
            parsed_clean = parsed_clean[3:]
        if parsed_clean.endswith("```"):
            parsed_clean = parsed_clean[:-3]
        parsed_clean = parsed_clean.strip()

        # Try to validate and parse the JSON response
        try:
            parsed_json = json.loads(parsed_clean)
            # Convert None values to empty strings
            # parsed_json = convert_values_to_strings(parsed_json)
            # print(parsed_json)
            # Validate and create Pydantic model
            resume_data = ResumeData(**parsed_json)
            parsed_info = resume_data
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to parse JSON response from AI: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to validate resume data: {str(e)}"
            )

        # Convert ResumeData to CandidateProfileRequest and create profile
        try:
            db: Session = next(get_db())
            profile_request = convert_resume_data_to_profile_request(parsed_info)
            created_profile = await create_profile(db=db, profile=profile_request)
            print(f"✅ Profile created for candidate: {created_profile}")
        except Exception as profile_error:
            print(f"⚠️ Warning: Failed to create profile: {profile_error}")

        return UploadPDFResponse(
            status="ok",
            parsed_info=parsed_info,
            candidate_id=candidate_id,
            resume_hash=resume_hash,
            file_metadata=file_metadata,
        )

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Resume extraction error: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


def convert_values_to_strings(obj):
    """Convert primitive values to strings, leave lists and dicts unchanged"""
    if isinstance(obj, dict):
        return {key: convert_values_to_strings(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_values_to_strings(item) for item in obj]
    elif obj is None:
        return ""
    elif isinstance(obj, (int, float, bool)):
        return str(obj)
    else:
        return obj  # Leave strings and other types as-is

def convert_resume_data_to_profile_request(resume_data: ResumeData) -> CandidateProfileRequest:
    """Convert ResumeData to CandidateProfileRequest format"""
    
    # Convert education data
    educations = []
    if resume_data.education:
        for edu in resume_data.education:
            educations.append({
                "level": edu.level,
                "field_of_study": edu.fieldOfStudy,
                "institution": edu.institution,
                "graduation_year": edu.graduationYear,
                "cgpa_grade": edu.cgpa_grade,
                "award": edu.award
            })
    
    # Convert experience data
    experiences = []
    if resume_data.experience:
        for exp in resume_data.experience:
            experiences.append({
                "employer": exp.employer,
                "industry": exp.industry,
                "start_date": exp.start,
                "end_date": exp.end,
                "seniority_level": exp.SeniorityLevel,
                "skills_tools_used": exp.SkillsToolsUsed,
                "project_highlights": exp.ProjectHighlights,
                "title": exp.Title,
                "achievements": exp.Achievements
            })
    
    # Convert nested Pydantic models to dictionaries
    preferences_dict = resume_data.preferences.model_dump() if resume_data.preferences else None
    
    # Fix personal_identifiers - ensure all None values are converted to empty strings
    personal_identifiers_dict = None
    if resume_data.personal_identifiers:
        personal_identifiers_dict = resume_data.personal_identifiers.model_dump()
        # Ensure all None values are converted to empty strings
        for key in personal_identifiers_dict:
            if personal_identifiers_dict[key] is None:
                personal_identifiers_dict[key] = ""
    
    # Fix skills - convert lists to strings for HardSkills and SoftSkills
    skills_dict = None
    if resume_data.skills:
        skills_dict = resume_data.skills.model_dump()
        # Convert HardSkills list to comma-separated string
        if isinstance(skills_dict.get('HardSkills'), list):
            skills_dict['HardSkills'] = ', '.join(skills_dict['HardSkills'])
        # Convert SoftSkills list to comma-separated string  
        if isinstance(skills_dict.get('SoftSkills'), list):
            skills_dict['SoftSkills'] = ', '.join(skills_dict['SoftSkills'])
    
    environment_dict = resume_data.environment.model_dump() if resume_data.environment else None
    
    # Convert language proficiencies to dictionaries
    language_proficiencies_list = []
    if resume_data.language_proficiencies:
        for lang in resume_data.language_proficiencies:
            language_proficiencies_list.append(lang.model_dump())
    
    # Create the profile request
    return CandidateProfileRequest(
        name=resume_data.name,
        candidate_email=resume_data.candidate_email,
        location=resume_data.location,
        profile_completion=resume_data.profile_completion,
        accommodations=resume_data.accommodations,
        preferences=preferences_dict,
        personal_identifiers=personal_identifiers_dict,
        skills=skills_dict,
        environment=environment_dict,
        language_proficiencies=language_proficiencies_list,
        neurodivergent_strengths=resume_data.neurodivergent_strengths.strengths,
        educations=educations,
        experiences=experiences,
        dateOfBirth=resume_data.dateOfBirth,
        applications=resume_data.applications,
        saved_jobs=resume_data.saved_jobs
    )
