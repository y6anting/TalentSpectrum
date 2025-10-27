import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from pypdf import PdfReader
from io import BytesIO

app = FastAPI()

# --- Load environment variables ---
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")

# --- Initialize Gemini ---
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.2,
    google_api_key=google_api_key
)

# --- Helper: Read PDF ---
def read_pdf_file(file_contents: BytesIO):
    try:
        pdf_reader = PdfReader(file_contents)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF file: {str(e)}")


# --- API Endpoint: Upload Resume & Get Feedback ---
@app.post("/resume-feedback")
async def resume_feedback(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Step 1: Read resume content
        contents = await file.read()
        text = read_pdf_file(BytesIO(contents))
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF. Please upload a text-based resume (not scanned).")
        
        # Step 2: Wrap into a Document (optional for structure)
        doc = Document(page_content=text, metadata={"filename": file.filename})

        # Step 3: Create the AI prompt
        prompt = ChatPromptTemplate.from_template("""
You are an empathetic professional career coach and resume analyst who specializes in supporting **neurodivergent candidates** (e.g., individuals with ADHD, autism, dyslexia, or other neurodiverse traits).

Your task is to review and provide constructive feedback on the following resume content.

Resume Content:
{resume_text}

Provide your response in a structured and supportive format that includes:

1. **Summary of the Candidate's Profile**  
   - Briefly describe the overall impression and key career focus of the candidate.

2. **Key Strengths**  
   - Highlight specific strengths, skills, and achievements.
   - Mention qualities that are often strong in neurodivergent individuals (e.g., creativity, attention to detail, persistence, pattern recognition) if visible in the resume.

3. **Areas for Improvement**  
   - Gently point out missing elements or unclear sections.
   - Avoid harsh criticism; focus on clarity, structure, and inclusivity.

4. **Personalized Suggestions to Enhance the Resume**  
   - Offer concrete, actionable advice to make the resume more professional, neurodiversity-friendly, and recruiter-ready.  
   - Suggest ways to highlight transferable skills, measurable results, or relevant projects.

5. **Overall Impression & Career Fit**  
   - Describe the types of roles, environments, or industries where this candidate may thrive.
   - Encourage self-advocacy and confidence in how they present their unique value.

Make your feedback **empathetic, encouraging, and detailed**, ensuring the tone is **kind, human, and uplifting**.
""")


        chain = prompt | llm

        # Step 4: Generate AI feedback
        response = chain.invoke({"resume_text": text})
        feedback = response.content if hasattr(response, "content") else str(response)

        # Step 5: Return as JSON
        return {
            "filename": file.filename,
            "feedback": feedback
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the resume: {str(e)}")
