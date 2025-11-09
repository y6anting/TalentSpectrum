"""
Resume Summary Router
AI-powered resume summarization using Google Gemini
"""
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from pypdf import PdfReader
from io import BytesIO
import json

router = APIRouter()

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

# Initialize Gemini if API key is available
gemini_model = None
if google_api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=google_api_key)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        print("✅ Google Gemini initialized for resume summary")
    except Exception as e:
        print(f"⚠️ Warning: Failed to initialize Gemini: {e}")
        gemini_model = None
else:
    print("⚠️ Warning: GOOGLE_API_KEY/GEMINI_API_KEY not found. Resume summary will use fallback responses.")

def read_pdf_file(file_contents: BytesIO):
    try:
        pdf_reader = PdfReader(file_contents)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF file: {str(e)}")


@router.post("/resume-summary")
async def resume_summary(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Step 1: Read resume content
        contents = await file.read()
        text = read_pdf_file(BytesIO(contents))
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
        
        if not gemini_model:
            # Fallback response if no API key
            return {
                "filename": file.filename,
                "summary": get_fallback_summary()
            }

        # Step 2: Create the AI prompt
        prompt = f"""
You are a professional resume analyzer. Summarize the following resume in a concise, structured format.

Resume Content:
{text}

Your task is to extract and summarize:
1. **Experience**: Brief summary of work experience including years and focus areas
2. **Education**: Educational background with degree and institution
3. **Skills**: List of key technical and soft skills (maximum 8 most important ones)
4. **Key Achievements**: List of notable accomplishments (3-5 items)

Return the response in JSON format:

{{
    "experience": "Brief description of work experience",
    "education": "Educational background",
    "skills": ["skill1", "skill2", "skill3", ...],
    "key_achievements": [
        "Achievement 1",
        "Achievement 2",
        "Achievement 3"
    ]
}}

Be concise, specific, and professional. Focus on the most relevant and impressive information.
Return only the JSON object, no other text.
"""

        # Step 3: Generate AI summary
        response = gemini_model.generate_content(prompt)
        summary = response.text

        # Step 4: Try to parse and validate JSON
        try:
            # Clean up the response
            summary_clean = summary.strip()
            if summary_clean.startswith("```json"):
                summary_clean = summary_clean[7:]
            if summary_clean.startswith("```"):
                summary_clean = summary_clean[3:]
            if summary_clean.endswith("```"):
                summary_clean = summary_clean[:-3]
            summary_clean = summary_clean.strip()
            
            # Validate it's valid JSON
            parsed_summary = json.loads(summary_clean)
            
            # Return as structured object
            return {
                "filename": file.filename,
                "summary": parsed_summary
            }
        except json.JSONDecodeError:
            # If not valid JSON, return the text as-is
            return {
                "filename": file.filename,
                "summary": summary
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

def get_fallback_summary():
    return {
        "experience": "Professional with demonstrated work history. Review resume for details.",
        "education": "Educational background documented in resume.",
        "skills": ["Communication", "Problem Solving", "Teamwork", "Time Management"],
        "key_achievements": [
            "Successfully completed projects and responsibilities",
            "Demonstrated professional growth",
            "Contributed to team objectives"
        ]
    }

