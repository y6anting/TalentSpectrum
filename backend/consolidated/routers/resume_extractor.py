# backend/consolidated/routers/resume_extractor.py
# Resume PDF parser using Google Gemini (no langchain)

import os
import hashlib
from datetime import datetime
from fastapi import APIRouter, UploadFile, HTTPException
from pypdf import PdfReader
from dotenv import load_dotenv
import google.generativeai as genai
import json

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

@router.post("/upload_pdf")
async def upload_pdf(file: UploadFile):
    """Upload, parse resume PDF using Gemini."""
    try:
        if not gemini_model:
            return {
                "status": "error",
                "message": "AI service not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY in .env file."
            }

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

        # Try to validate it's valid JSON
        try:
            json.loads(parsed_clean)
            parsed_text = parsed_clean
        except:
            # If not valid JSON, return as-is
            pass

        return {
            "status": "ok",
            "parsed_info": parsed_text,
            "candidate_id": candidate_id,
            "resume_hash": resume_hash,
            "file_metadata": file_metadata,
        }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Resume extraction error: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
