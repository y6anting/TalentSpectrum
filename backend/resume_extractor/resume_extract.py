import os
import hashlib
from datetime import datetime
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.vectorstores import InMemoryVectorStore
from dotenv import load_dotenv
import google.generativeai as genai

# ==========================
# Load environment variables
# ==========================
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("❌ GOOGLE_API_KEY not found in .env")

# Configure Gemini API
genai.configure(api_key=api_key)

# ==========================
# Init app
# ==========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PDFS_DIR = "../pdfs"
os.makedirs(PDFS_DIR, exist_ok=True)

# ==========================
# Embeddings + Vector Store
# ==========================
# embeddings = GoogleGenerativeAIEmbeddings(model="embedding-001")
# vector_store = InMemoryVectorStore(embeddings)
embeddings = None
vector_store = None

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
   - If YY ≥ current year’s last two digits, assume **19YY**; otherwise, assume **20YY**.
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

# ==========================
# API Endpoint
# ==========================
@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile):
    """Upload, embed, and parse resume PDF using Gemini."""
    try:
        filepath = os.path.join(PDFS_DIR, file.filename)
        with open(filepath, "wb") as f:
            f.write(await file.read())

        # Extract text
        reader = PdfReader(filepath)
        text = "\n\n".join([p.extract_text() or "" for p in reader.pages])
        if not text.strip():
            return {"status": "error", "message": "No extractable text found."}

        # Chunk text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=200,
            add_start_index=True,
        )
        chunks = text_splitter.split_text(text)

        # # Reset vector store
        # global vector_store
        # vector_store = InMemoryVectorStore(embeddings)
        # vector_store.add_texts(chunks)

        # # Retrieve top chunks
        # docs = vector_store.similarity_search(
        #     "Summarize and extract candidate details", 
        #     k=min(5, len(chunks))
        # )
        # context = "\n\n".join([doc.page_content for doc in docs])
        context = "\n\n".join(chunks)

        # Metadata
        candidate_id = hashlib.md5(file.filename.encode()).hexdigest()[:8]
        file_metadata = {
            "creation_date": datetime.now().isoformat(),
            "last_modified": datetime.now().isoformat(),
        }
        resume_hash = hashlib.sha256(text.encode()).hexdigest()[:16]

        # Prompt and model
        prompt = ChatPromptTemplate.from_template(TEMPLATE)
        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.2,
            max_output_tokens=2048,
        )
        chain = prompt | model
        answer = chain.invoke({"context": context})

        # ✅ Extract only the text part so React can display it
        if hasattr(answer, "content"):
            parsed_text = answer.content
        else:
            parsed_text = str(answer)

        return {
            "status": "ok",
            "parsed_info": parsed_text,  # changed from 'answer'
            "chunks_indexed": len(chunks),
            "candidate_id": candidate_id,
            "resume_hash": resume_hash,
            "file_metadata": file_metadata,
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}