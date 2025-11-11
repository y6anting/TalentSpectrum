import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from pypdf import PdfReader
from io import BytesIO
import json

router = APIRouter()

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

gemini_model = None
if google_api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=google_api_key)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        print("✅ Google Gemini initialized for resume feedback")
    except Exception as e:
        print(f"⚠️ Warning: Failed to initialize Gemini: {e}")
        gemini_model = None
else:
    print("⚠️ Warning: GOOGLE_API_KEY/GEMINI_API_KEY not found. Resume feedback will use fallback responses.")

def read_pdf_file(file_contents: BytesIO):
    try:
        pdf_reader = PdfReader(file_contents)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF file: {str(e)}")


@router.post("/resume-feedback")
async def resume_feedback(file: UploadFile = File(...)):
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
                "feedback": get_fallback_feedback()
            }

        # Step 2: Create the AI prompt
        prompt = f"""
You are an empathetic professional career coach and resume analyst who specializes in supporting **neurodivergent candidates**.

Resume Content:
{text}

Your task is to analyze the candidate's resume and provide a JSON response in this structure:

{{
    "resume_feedback": {{
        "overall_resume_score": <0-100>,
        "summary": "Brief overview of how well the resume presents the candidate's strengths and fit for their desired roles.",
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
5. Suggest career roles that align with their demonstrated skills or work style.

Return only the JSON object, no other text.
"""

        # Step 3: Generate AI feedback
        response = gemini_model.generate_content(prompt)
        feedback = response.text

        # Step 4: Try to parse and validate JSON
        try:
            # Clean up the response
            feedback_clean = feedback.strip()
            if feedback_clean.startswith("```json"):
                feedback_clean = feedback_clean[7:]
            if feedback_clean.startswith("```"):
                feedback_clean = feedback_clean[3:]
            if feedback_clean.endswith("```"):
                feedback_clean = feedback_clean[:-3]
            feedback_clean = feedback_clean.strip()
            
            # Validate it's valid JSON
            json.loads(feedback_clean)
            feedback = feedback_clean
        except:
            # If not valid JSON, return as-is
            pass

        # Step 5: Return as JSON
        return {
            "filename": file.filename,
            "feedback": feedback
        }
        console.log(feedback)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

def get_fallback_feedback():
    """Fallback feedback if AI is unavailable"""
    return {
        "resume_feedback": {
            "overall_resume_score": 75,
            "summary": "Your resume shows good potential. Consider adding more specific examples and quantifiable achievements.",
            "strengths": [
                "Clear and organized structure",
                "Good educational background",
                "Relevant work experience"
            ],
            "areas_for_improvement": [
                "Add more quantifiable achievements (e.g., metrics, percentages)",
                "Include specific technical skills relevant to your target role",
                "Expand on project details and your contributions"
            ],
            "recommendations": {
                "what_to_add": ["Specific accomplishments with numbers", "Relevant certifications or courses"],
                "what_to_remove": ["Outdated skills or irrelevant experiences"],
                "formatting_tips": ["Use bullet points for better readability", "Ensure consistent font and spacing"],
                "tone_and_language": ["Use action verbs to start bullet points", "Be confident in describing your achievements"]
            }
        },
        "career_guidance": {
            "suitable_job_roles": [
                {"role": "Software Developer", "reason": "Good match based on technical skills and problem-solving abilities"},
                {"role": "Data Analyst", "reason": "Analytical thinking and attention to detail are strong assets"}
            ],
            "transferable_skills": ["Communication", "Problem-solving", "Teamwork", "Time management"],
            "next_steps": [
                "Update resume with specific achievements",
                "Consider relevant certifications",
                "Practice interview skills",
                "Network with professionals in your field"
            ]
        }
    }

