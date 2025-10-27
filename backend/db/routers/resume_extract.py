import os
import hashlib
from datetime import datetime
from fastapi import APIRouter, UploadFile
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
router = APIRouter()

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
You are a resume parser. Extract the following structured information in JSON format:

Personal Identifiers:
- Full name
- Date of birth
- Gender
- Nationality
- Identification number (IC/Passport)
- Email address
- Phone number
- Residential address
- LinkedIn profile
- Personal website/portfolio link
- Social media handles (if provided)

Metadata:
- Candidate ID (system-generated)
- Resume version hash
- File metadata (creation date, last modified)

Education:
- Highest education level
- Field(s) of study
- Institutions
- Graduation year(s)
- Certifications

Work Experience:
- Industry
- Role/title
- Years of experience in role
- Skills/tools used
- Seniority level
- Project highlights

Skills:
- Hard skills
- Soft skills
- Proficiency levels
- Technical keywords

Achievements / Portfolio:
- Published works
- Awards/recognitions
- Patents/projects
- Portfolio/GitHub/Behance links

Language Proficiency:
- Languages spoken
- Proficiency level

Job Preferences:
- Preferred industries
- Preferred roles
- Location preference
- Availability

Behavioral / Derived Features:
- Consistency score
- Keyword embeddings
- Resume length / richness index
- Time progression (career timeline)

Resume text:
{context}
"""

# ==========================
# API Endpoint
# ==========================
@router.post("/upload_pdf")
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