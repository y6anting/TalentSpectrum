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





# --- MANDATORY PARSING RULES (follow in order) ---

# **1. Scan the ENTIRE document line-by-line** – headers, footers, bullet points, tables, and footnotes are all valid sources.

# **2. EDUCATION (never skip)**
#    - Include **every** degree, diploma, foundation, training, certification, or course.
#    - Allowed `level` values:  
#      `["PT3","SPM / O-level","STPM / A-level / Diploma","Degree","Master","PhD","Vocational","Professional Certificate"]`
#    - If the level does not match, **leave empty string** but **still create the entry**.
#    - `graduationYear`: extract the year (e.g., 2014, 2010). If not a number between 1990–2025 → `""`.
#    - `cgpa_grade`: extract GPA, CGPA, class, or “First Class Honours”.
#    - `award`: any Dean’s List, scholarship, symposium, etc.

# **3. EXPERIENCE (never skip)**
#    - **Every** job, internship, freelance, project, prototype, training role, or volunteer work → **one entry**.
#    - **Employer**: company name or “Personal Project” / “Prototype” if none.
#    - **Title**: exact role (e.g., “CNC Programming Engineer”, “Project Designer & Coordinator”, “Volunteer”).
#    - **Dates**: 
#      - Look for patterns: `2019-2025`, `2016`, `2025-present`, `2024-present`.
#      - Convert to `start` = earliest year/month, `end` = latest or `""` if “present”.
#      - Set `"isCurrent": "true"` **only if “present”, “current”, or “-present” appears**.
#    - **SeniorityLevel**: infer from title/duties:
#      - Engineer, Designer, Volunteer → `"Non-executive"`
#      - Coordinator, Lead → `"Executive"`
#      - Manager, Head → `"Managerial"`
#      - Unknown → `""`
#    - **Achievements / ProjectHighlights**: copy **every bullet** under the role into `Achievements` (comma-separated) **and** into `ProjectHighlights` if it describes a deliverable.
#    - **SkillsToolsUsed**: list every tool/software mentioned under the role.

# **4. ADDITIONAL TRAINING → treat as EXPERIENCE**
#    - Example: “Gamuda AI Academy”, “Employment Transition Programme”, “Expert Craftsman in PLC” → full entries in `experience`.
#    - Use institution as `employer`, course name as `Title`, dates as `start`/`end`.

# **5. VOLUNTEERING → treat as EXPERIENCE**
#    - Use organization as `employer`, “Volunteer” as `Title`, dates, and bullets.

# **6. SKILLS**
#    - **HardSkills**: every technical tool, software, standard (SolidWorks, HyperMill, GD&T, Python, etc.)
#    - **SoftSkills**: problem-solving, communication, teamwork, adaptability, etc.
#    - **No duplicates**, case-insensitive dedupe.

# **7. LANGUAGES**
#    - Normalize: `"Malay"` → `"Malay"`, `"English"` → `"English"`, `"Mandarin"` → `"Chinese"`.
#    - Proficiency: `"Fluent"` → `"Expert"`, `"Proficient"` → `"Intermediate"`, else `"Beginner"` or `""`.

# **8. PERSONAL IDENTIFIERS**
#    - `fullName`: exactly as in header.
#    - `emailAddress`, `phoneNumber`: clean format.
#    - `nationality`: infer from NRIC, address, or context → `"Malaysian"` if in Malaysia.
#    - `dateOfBirth`: if NRIC present → first 6 digits → `YYYY-MM-DD` (YY≥25→19YY, else 20YY). Else `""`.

# **9. NEURODIVERGENT / ACCOMMODATIONS**
#    - If “Level 1 ASD”, “autistic”, “autism” appears → add to `accommodations` and `neurodivergent_strengths.strengths`.

# **10. FINAL VALIDATION (you must do this)**
#    - `education` **must not be empty** if any degree/training exists.
#    - `experience` **must not be empty** if any job/training/volunteer exists.
#    - All arrays: remove duplicates, strip whitespace.
#    - All dates: ISO `YYYY` or `YYYY-MM`.

# **OUTPUT ONLY THE JSON** – no markdown, no explanations, no extra text.

@router.post("/upload_pdf", response_model=UploadPDFResponse)
async def upload_pdf(file: UploadFile, session_email: str = None):
    """Upload, parse resume PDF using Gemini. Use session_email as fallback if resume has no email."""
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

        # Save file with unique name based on email or session_email
        # Use email from session or generate unique filename
        if session_email:
            # Sanitize email for filename
            safe_email = session_email.replace('@', '_').replace('.', '_')
            filename = f"{safe_email}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        else:
            # Use original filename but make it unique
            base_name = os.path.splitext(file.filename)[0]
            filename = f"{base_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        filepath = os.path.join(PDFS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(await file.read())
        
        # Store relative path for database (relative to PDFS_DIR)
        resume_url = f"/{PDFS_DIR}/{filename}"

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
            
            # Debug: Print extracted data
            print(f"📋 Extracted education entries: {len(parsed_json.get('education', []))}")
            print(f"📋 Extracted experience entries: {len(parsed_json.get('experience', []))}")
            if parsed_json.get('education'):
                print(f"   Education sample: {parsed_json['education'][0] if parsed_json['education'] else 'None'}")
            if parsed_json.get('experience'):
                print(f"   Experience sample: {parsed_json['experience'][0] if parsed_json['experience'] else 'None'}")
            
            # Ensure education and experience are arrays (not None)
            if 'education' not in parsed_json or parsed_json['education'] is None:
                parsed_json['education'] = []
            if 'experience' not in parsed_json or parsed_json['experience'] is None:
                parsed_json['experience'] = []
            
            # CRITICAL: If arrays are empty but resume text contains education/experience keywords, retry with more explicit prompt
            education_keywords = ['education', 'degree', 'diploma', 'university', 'college', 'institute', 'bachelor', 'master', 'phd', 'graduated', 'cgpa', 'gpa']
            experience_keywords = ['experience', 'work', 'employment', 'job', 'position', 'role', 'project', 'internship', 'volunteer', 'training', 'coordinator', 'engineer', 'manager']
            
            text_lower = text.lower()
            has_education_keywords = any(keyword in text_lower for keyword in education_keywords)
            has_experience_keywords = any(keyword in text_lower for keyword in experience_keywords)
            
            if (len(parsed_json.get('education', [])) == 0 and has_education_keywords) or \
               (len(parsed_json.get('experience', [])) == 0 and has_experience_keywords):
                print("⚠️ WARNING: Empty arrays detected but keywords found in resume. Retrying with explicit extraction...")
                
                # Create a more explicit retry prompt
                retry_prompt = f"""
The previous extraction missed education or experience data. Please re-extract from this resume text.

RESUME TEXT:
{text[:5000]}  # Limit to first 5000 chars to avoid token limits

CRITICAL: You MUST extract:
1. ALL education entries (degrees, diplomas, certificates, training) into the "education" array
2. ALL work experience entries (jobs, internships, projects, volunteer work) into the "experience" array

If you see ANY mention of:
- Education: university, college, degree, diploma, certificate, training, graduated, CGPA, GPA
- Experience: job, work, employment, project, internship, volunteer, coordinator, engineer, manager, position, role

Then the respective array MUST NOT be empty. Extract EVERY entry you find.

Output ONLY valid JSON matching the schema, with education and experience arrays populated.
"""
                
                try:
                    retry_response = gemini_model.generate_content(
                        retry_prompt,
                        safety_settings=safety_settings
                    )
                    
                    if retry_response and retry_response.text:
                        retry_clean = retry_response.text.strip()
                        # Clean markdown if present
                        if retry_clean.startswith("```json"):
                            retry_clean = retry_clean[7:]
                        if retry_clean.startswith("```"):
                            retry_clean = retry_clean[3:]
                        if retry_clean.endswith("```"):
                            retry_clean = retry_clean[:-3]
                        retry_clean = retry_clean.strip()
                        
                        retry_json = json.loads(retry_clean)
                        
                        # Merge retry results, prioritizing non-empty arrays
                        if len(retry_json.get('education', [])) > 0:
                            parsed_json['education'] = retry_json['education']
                            print(f"✅ Retry extracted {len(parsed_json['education'])} education entries")
                        if len(retry_json.get('experience', [])) > 0:
                            parsed_json['experience'] = retry_json['experience']
                            print(f"✅ Retry extracted {len(parsed_json['experience'])} experience entries")
                except Exception as retry_error:
                    print(f"⚠️ Retry failed: {retry_error}")
            
            # Validate and create Pydantic model
            resume_data = ResumeData(**parsed_json)
            parsed_info = resume_data
            
            # Final validation check
            if len(parsed_info.education) == 0:
                print("⚠️ WARNING: No education entries extracted from resume!")
                print(f"   Resume text preview: {text[:200]}...")
            if len(parsed_info.experience) == 0:
                print("⚠️ WARNING: No experience entries extracted from resume!")
                print(f"   Resume text preview: {text[:200]}...")
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
            
            # Get resume email from parsed data
            resume_email = profile_request.candidate_email or profile_request.email
            
            # CRITICAL: Always use session_email (login email) as primary candidate_email
            # This ensures profile is always linked to the logged-in user
            if not session_email:
                raise HTTPException(
                    status_code=400,
                    detail="Session email is required. Please ensure you are logged in."
                )
            
            # Use session email as primary identifier
            primary_email = session_email.lower().strip()
            profile_request.candidate_email = primary_email
            profile_request.email = primary_email
            
            # Store resume email in personal_identifiers if it differs from login email
            if resume_email and resume_email.lower().strip() != primary_email:
                print(f"📧 Resume email ({resume_email}) differs from login email ({primary_email}). Linking them.")
                if not profile_request.personal_identifiers:
                    profile_request.personal_identifiers = {}
                # Store resume email in personal_identifiers for reference
                profile_request.personal_identifiers["resume_email"] = resume_email
                # Also keep emailAddress as resume email if it's more complete
                if resume_email and not profile_request.personal_identifiers.get("emailAddress"):
                    profile_request.personal_identifiers["emailAddress"] = resume_email
            
            # Check if profile exists with resume email - if so, we need to merge/update it
            from database.models.candidate import CandidateProfile
            if resume_email and resume_email.lower().strip() != primary_email:
                existing_profile_with_resume_email = db.query(CandidateProfile).filter(
                    CandidateProfile.candidate_email == resume_email.lower().strip()
                ).first()
                
                if existing_profile_with_resume_email:
                    print(f"⚠️ Found existing profile with resume email ({resume_email}). Updating to use login email ({primary_email}).")
                    # Update the existing profile to use login email
                    existing_profile_with_resume_email.candidate_email = primary_email
                    # Merge data from resume into existing profile
                    # Update education and experience records to use new email
                    from database.models.candidate import Education, Experience
                    db.query(Education).filter(Education.candidate_email == resume_email.lower().strip()).update(
                        {Education.candidate_email: primary_email}
                    )
                    db.query(Experience).filter(Experience.candidate_email == resume_email.lower().strip()).update(
                        {Experience.candidate_email: primary_email}
                    )
                    db.commit()
                    print(f"✅ Merged profile from resume email to login email")
            
            # Check if profile exists with login email - update it, otherwise create new
            existing_profile = db.query(CandidateProfile).filter(
                CandidateProfile.candidate_email == primary_email
            ).first()
            
            if existing_profile:
                print(f"📝 Updating existing profile for login email: {primary_email}")
                # Update existing profile with resume data
                from routers.profiles import update_profile
                updated_profile = await update_profile(db, primary_email, profile_request)
            else:
                print(f"✨ Creating new profile for login email: {primary_email}")
                created_profile = await create_profile(db=db, profile=profile_request)
                print(f"✅ Profile created for candidate: {created_profile}")
            
            # Update profile with resume URL using login email
            profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_email == primary_email).first()
            if profile:
                profile.resume_url = resume_url
                db.commit()
                db.refresh(profile)
                print(f"✅ Resume URL saved to profile: {resume_url}")
        except Exception as profile_error:
            import traceback
            print(f"⚠️ Warning: Failed to create/update profile: {profile_error}")
            print(traceback.format_exc())

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
    print(f"🔄 Converting {len(resume_data.education)} education entries...")
    if resume_data.education:
        for i, edu in enumerate(resume_data.education):
            edu_dict = {
                "level": edu.level or "",
                "field_of_study": edu.fieldOfStudy or "",
                "institution": edu.institution or "",
                "graduation_year": edu.graduationYear or 0,
                "cgpa_grade": edu.cgpa_grade or "",
                "award": edu.award or ""
            }
            educations.append(edu_dict)
            print(f"   Education {i+1}: {edu_dict.get('level')} in {edu_dict.get('field_of_study')} from {edu_dict.get('institution')}")
    else:
        print("⚠️ No education data in resume_data.education")
    
    # Convert experience data
    experiences = []
    print(f"🔄 Converting {len(resume_data.experience)} experience entries...")
    if resume_data.experience:
        for i, exp in enumerate(resume_data.experience):
            exp_dict = {
                "employer": exp.employer or "",
                "industry": exp.industry or "",
                "start_date": exp.start or "",
                "end_date": exp.end or "",
                "seniority_level": exp.SeniorityLevel or "",
                "skills_tools_used": exp.SkillsToolsUsed or "",
                "project_highlights": exp.ProjectHighlights or "",
                "title": exp.Title or "",
                "achievements": exp.Achievements or ""
            }
            experiences.append(exp_dict)
            print(f"   Experience {i+1}: {exp_dict.get('title')} at {exp_dict.get('employer')}")
    else:
        print("⚠️ No experience data in resume_data.experience")
    
    print(f"✅ Converted: {len(educations)} educations, {len(experiences)} experiences")
    
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
