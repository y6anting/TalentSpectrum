import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from pypdf import PdfReader
from io import BytesIO

app = FastAPI()

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.2,
    google_api_key=google_api_key
)

def read_pdf_file(file_contents: BytesIO):
    try:
        pdf_reader = PdfReader(file_contents)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF file: {str(e)}")


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

        Resume Content:
        {resume_text}

        Your task is to analyze the candidate’s resume and provide a JSON response in this structure:

        {{
            "resume_feedback": {{
                "overall_resume_score": <0-100>,
                "summary": "Brief overview of how well the resume presents the candidate’s strengths and fit for their desired roles.",
                "strengths": [],
                "areas_for_improvement": [],
                "recommendations": {{
                    "what_to_add": ["specific sections, keywords, or examples to include"],
                    "what_to_remove": ["unnecessary, outdated, or confusing content to simplify"],
                    "formatting_tips": ["clear and simple suggestions to make layout neurodivergent-friendly and readable"],
                    "tone_and_language": ["advice to make tone confident, inclusive, and authentic"]
                }}
            }},
            "career_guidance": {{
                "suitable_job_roles": [
                    {{
                        "role": "string",
                        "reason": "why this role fits based on skills, interests, and neurodivergent strengths"
                    }}
                ],
                "transferable_skills": [],
                "next_steps": ["practical suggestions for improving employability or tailoring resume to roles"]
            }}
        }}

        Consider:
        1. Use an encouraging, non-judgmental tone.
        2. Focus on practical, specific, and small steps the candidate can take to improve.
        3. Highlight neurodivergent strengths (e.g., detail-oriented, analytical thinking, creativity, empathy, persistence).
        4. Avoid overly technical or critical phrasing.
        5. If possible, suggest career roles that align with their demonstrated skills or work style.

        Return only the JSON object, no other text.
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
