"""
Mock Interview Router
Complete mock interview system with:
- AI-powered question generation
- Speech transcription (OpenAI Whisper)
- AI feedback generation (Google Gemini)
- Interview report storage and retrieval
"""
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
import json
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models.mock_interview import (
    JobPosition, InterviewQuestion, GenerateQuestionsRequest, Answer, FeedbackRequest,
    InterviewReport, InterviewReportCreate, InterviewReportResponse
)

router = APIRouter()

load_dotenv()

# Environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize AI clients if keys are available
gemini_available = bool(GEMINI_API_KEY)
openai_available = bool(OPENAI_API_KEY)

if gemini_available:
    from google.generativeai import GenerativeModel, configure
    configure(api_key=GEMINI_API_KEY)
    gemini_model = GenerativeModel('gemini-2.5-flash')
else:
    print("⚠️ Warning: GEMINI_API_KEY not found. Using fallback responses for interview generation.")
    gemini_model = None

if openai_available:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
else:
    print("⚠️ Warning: OPENAI_API_KEY not found. Transcription will not be available.")
    openai_client = None


# --- Pydantic Models ---

class JobPosition(BaseModel):
    title: str
    description: str
    requirements: List[str]
    level: Literal["entry", "mid", "senior"]
    industry: str

class InterviewQuestion(BaseModel):
    id: str
    question: str
    type: Literal["general", "technical", "behavioral"]
    difficulty: Literal["easy", "medium", "hard"]
    expectedDuration: int

class GenerateQuestionsRequest(BaseModel):
    jobPosition: JobPosition
    interviewType: Literal["general", "technical", "behavioral"]
    numberOfQuestions: int = 5

class Answer(BaseModel):
    question: str
    answer: str
    timestamp: datetime

class FeedbackRequest(BaseModel):
    jobPosition: JobPosition
    interviewType: Literal["general", "technical", "behavioral"]
    answers: List[Answer]


# --- Question Generation ---

@router.post("/generate-interview-questions")
async def generate_interview_questions(request: GenerateQuestionsRequest):
    """
    Generate AI-powered interview questions based on job position and type
    """
    try:
        if not gemini_model:
            return {
                "questions": get_fallback_questions(request.interviewType, request.numberOfQuestions),
                "success": False,
                "source": "fallback"
            }

        prompt = create_questions_prompt(
            request.jobPosition,
            request.interviewType,
            request.numberOfQuestions
        )

        response = gemini_model.generate_content(prompt)
        text = response.text

        questions = parse_questions_from_response(text, request.interviewType)

        if questions and len(questions) > 0:
            return {
                "questions": questions,
                "success": True,
                "source": "gemini"
            }
        else:
            return {
                "questions": get_fallback_questions(request.interviewType, request.numberOfQuestions),
                "success": False,
                "source": "fallback"
            }

    except Exception as e:
        print(f"Error generating questions: {e}")
        return {
            "questions": get_fallback_questions(request.interviewType, request.numberOfQuestions),
            "success": False,
            "source": "fallback",
            "error": str(e)
        }


def create_questions_prompt(job: JobPosition, interview_type: str, num_questions: int) -> str:
    base_context = f"""
Job Title: {job.title}
Job Description: {job.description}
Requirements: {', '.join(job.requirements)}
Experience Level: {job.level}
Industry: {job.industry}
"""

    type_prompts = {
        "general": f"""
Generate {num_questions} general interview questions for this position.
Focus on: basic qualifications, motivation, career goals, company fit, professional interests.
Make questions conversational and suitable for a {job.level} level position.
""",
        "technical": f"""
Generate {num_questions} technical interview questions for this position.
Focus on: specific technical skills, problem-solving scenarios, technology stack, code quality, best practices.
Adjust difficulty based on {job.level} level.
""",
        "behavioral": f"""
Generate {num_questions} behavioral interview questions for this position.
Focus on: past experiences, teamwork, leadership, conflict resolution, adaptability, project management.
Use STAR method framework and make questions specific to {job.level} level expectations.
"""
    }

    return f"""
{base_context}

{type_prompts.get(interview_type, type_prompts["general"])}

Format your response as a JSON array with the following structure:
[
  {{
    "question": "Your interview question here",
    "difficulty": "easy|medium|hard",
    "expectedDuration": 2
  }}
]

Requirements:
- Return exactly {num_questions} questions
- Make questions specific to the job requirements
- Vary difficulty appropriately for {job.level} level
- Each question should take 1-3 minutes to answer
- Questions should be natural and conversational
- Avoid generic questions
"""


def parse_questions_from_response(response: str, interview_type: str) -> List[dict]:
    try:
        # Try to extract JSON array from response
        import re
        json_match = re.search(r'\[[\s\S]*\]', response)
        if json_match:
            parsed = json.loads(json_match.group(0))
            return [
                {
                    "id": f"{interview_type}-{int(datetime.now().timestamp())}-{i}",
                    "question": item.get("question", ""),
                    "type": interview_type,
                    "difficulty": item.get("difficulty", "medium"),
                    "expectedDuration": item.get("expectedDuration", 2)
                }
                for i, item in enumerate(parsed)
            ]

        # Fallback: parse line by line
        lines = [
            line.strip()
            for line in response.split('\n')
            if line.strip() and len(line.strip()) > 20
        ]
        lines = [re.sub(r'^\d+\.?\s*', '', line) for line in lines]

        return [
            {
                "id": f"{interview_type}-{int(datetime.now().timestamp())}-{i}",
                "question": question,
                "type": interview_type,
                "difficulty": "medium",
                "expectedDuration": 2
            }
            for i, question in enumerate(lines[:5])
        ]

    except Exception as e:
        print(f"Error parsing questions: {e}")
        return []


def get_fallback_questions(interview_type: str, num_questions: int) -> List[dict]:
    fallbacks = {
        "general": [
            "Tell me about yourself and your professional background.",
            "Why are you interested in this specific position?",
            "What attracted you to our company?",
            "What are your greatest professional strengths?",
            "Where do you see your career heading in the next few years?"
        ],
        "technical": [
            "Walk me through your experience with the main technologies required for this role.",
            "How do you approach debugging a complex technical problem?",
            "Describe the most challenging technical project you've worked on.",
            "How do you ensure code quality in your projects?",
            "Explain your development workflow from concept to deployment."
        ],
        "behavioral": [
            "Tell me about a time you faced a significant challenge at work and how you overcame it.",
            "Describe a situation where you had to work with a difficult team member.",
            "Give me an example of when you had to learn something completely new under pressure.",
            "Tell me about a time you made a mistake and how you handled it.",
            "Describe a situation where you had to meet a very tight deadline."
        ]
    }

    questions = fallbacks.get(interview_type, fallbacks["general"])

    return [
        {
            "id": f"fallback-{interview_type}-{i}",
            "question": q,
            "type": interview_type,
            "difficulty": "medium",
            "expectedDuration": 2
        }
        for i, q in enumerate(questions[:num_questions])
    ]


# --- Feedback Generation ---

@router.post("/mock-interview-feedback")
async def generate_feedback(request: FeedbackRequest):
    """
    Generate AI-powered feedback based on interview answers
    """
    try:
        if not gemini_model:
            return {
                "feedback": get_fallback_feedback(request.interviewType, len(request.answers)),
                "success": False,
                "source": "fallback"
            }

        prompt = create_feedback_prompt(
            request.jobPosition,
            request.interviewType,
            request.answers
        )

        response = gemini_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )

        feedback_text = response.text

        # Clean and parse response
        try:
            import re
            cleaned_text = feedback_text.strip()

            # Remove code block wrappers
            code_block_match = re.match(r'^```(?:json)?\s*\n?([\s\S]*?)\n?```$', cleaned_text)
            if code_block_match:
                cleaned_text = code_block_match.group(1).strip()

            # Remove quotes
            if (cleaned_text.startswith('"') and cleaned_text.endswith('"')) or \
               (cleaned_text.startswith("'") and cleaned_text.endswith("'")):
                cleaned_text = cleaned_text[1:-1]

            feedback_json = json.loads(cleaned_text)

            # Ensure overall_score is a number
            if "overall_score" in feedback_json:
                feedback_json["overall_score"] = int(feedback_json["overall_score"])

            return {
                "feedback": feedback_json,
                "success": True,
                "source": "gemini"
            }

        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            return {
                "feedback": {
                    "overall_score": 75,
                    "overall": feedback_text,
                    "strengths": [],
                    "areas_for_improvement": []
                },
                "success": False,
                "source": "gemini-fallback"
            }

    except Exception as e:
        print(f"Error generating feedback: {e}")
        return {
            "feedback": get_fallback_feedback(request.interviewType, len(request.answers)),
            "success": False,
            "source": "fallback",
            "error": str(e)
        }


def create_feedback_prompt(job: JobPosition, interview_type: str, answers: List[Answer]) -> str:
    context_info = f"""
Position: {job.title}
Industry: {job.industry}
Experience Level: {job.level}
Interview Type: {interview_type}
Key Requirements: {', '.join(job.requirements)}
"""

    qa_section = "\n".join([
        f"\nQuestion {i + 1}: {ans.question}\nAnswer: {ans.answer or '[No answer provided]'}"
        for i, ans in enumerate(answers)
    ])

    return f"""
You are an empathetic and professional interview coach giving structured feedback for a {interview_type} mock interview.

{context_info}

Candidate's Responses:
{qa_section}

CRITICAL: Return ONLY a valid JSON object. Do NOT include markdown code fences, explanations, or any text outside the JSON. Each sentence must be under 10 words.

Return this exact JSON structure:

{{
  "overall_score": <number between 0-100>,
  "overall": "1-2 sentences summarizing the candidate's performance, tone, and readiness for {job.title}. Be encouraging and highlight their potential.",
  "strengths": [
    "Specific strength 1 based on their answers",
    "Specific strength 2 based on their answers",
    "Specific strength 3 based on their answers"
  ],
  "areas_for_improvement": [
    "Specific improvement area 1 with actionable tips",
    "Specific improvement area 2 with actionable tips",
    "Specific improvement area 3 with actionable tips"
  ]
}}

Guidelines:
- Be concise, supportive, and specific to their actual answers
- Use a friendly, encouraging tone
- Tailor advice to {job.level}-level expectations for {job.title}
- Consider neurodivergent-friendly feedback: clear, structured, non-judgmental
- The overall_score should reflect readiness for the role (0-100 scale)
- Include at least 3 items in each array
- NO markdown formatting, NO code fences, NO extra text - ONLY the JSON object
"""


def get_fallback_feedback(interview_type: str, answers_count: int) -> dict:
    return {
        "overall_score": 75,
        "overall": f"You completed a {interview_type} interview with {answers_count} questions. Good effort — your answers show strong motivation and willingness to improve.",
        "strengths": [
            "Actively participated throughout the interview.",
            "Clear and confident communication.",
            "Demonstrated self-awareness and enthusiasm."
        ],
        "areas_for_improvement": [
            "Provide more detailed examples using the STAR method (Situation, Task, Action, Result).",
            "Be more specific with metrics and quantifiable results to demonstrate impact.",
            f"Add more {interview_type}-specific keywords and terminology to show deeper domain knowledge."
        ]
    }


# --- Transcription ---

@router.post("/mock-interview-transcription")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio using OpenAI Whisper API
    """
    try:
        if not openai_client:
            return {
                "text": "",
                "error": "OpenAI API key not configured",
                "success": False
            }

        # Read file
        audio_data = await file.read()

        if len(audio_data) == 0:
            return {
                "text": "",
                "error": "Empty audio file",
                "success": False
            }

        # Create a temporary file-like object
        import io
        audio_file = io.BytesIO(audio_data)
        audio_file.name = "recording.webm"

        # Call OpenAI Whisper
        response = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en"
        )

        return {
            "text": response.text,
            "success": True
        }

    except Exception as e:
        print(f"Transcription error: {e}")
        return {
            "text": "",
            "error": str(e),
            "success": False
        }


@router.get("/")
def mock_interview_status():
    return {
        "message": "Mock Interview Service",
        "status": "running",
        "features": {
            "question_generation": gemini_available,
            "feedback_generation": gemini_available,
            "transcription": openai_available,
            "report_storage": True
        }
    }


# --- Interview Report Storage ---

@router.post("/reports", response_model=InterviewReportResponse)
async def create_interview_report(report: InterviewReportCreate, db: Session = Depends(get_db)):
    """
    Save an interview report to the database
    """
    try:
        # Convert string dates to datetime
        start_time = datetime.fromisoformat(report.start_time.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(report.end_time.replace('Z', '+00:00'))
        
        # Process questions_data - handle both Pydantic models and dicts
        questions_data_list = []
        if report.questions_data:
            for q in report.questions_data:
                if hasattr(q, 'dict'):
                    # It's a Pydantic model
                    q_dict = q.dict()
                elif isinstance(q, dict):
                    # It's already a dict
                    q_dict = q
                else:
                    continue
                # Ensure all required fields are present
                questions_data_list.append({
                    "question": q_dict.get("question", ""),
                    "answer": q_dict.get("answer", ""),
                    "type": q_dict.get("type", "general"),
                    "feedback": q_dict.get("feedback"),
                    "score": q_dict.get("score"),
                    "hasAudio": q_dict.get("hasAudio", False)
                })
        
        print(f"Saving report with {len(questions_data_list)} questions/answers")
        print(f"Sample questions_data: {questions_data_list[:2] if questions_data_list else 'None'}")
        
        # Create database model
        db_report = InterviewReport(
            candidate_email=report.candidate_email,
            position_title=report.position_title,
            position_level=report.position_level,
            interview_type=report.interview_type,
            total_questions=report.total_questions,
            start_time=start_time,
            end_time=end_time,
            duration_seconds=report.duration_seconds,
            overall_score=report.overall_score,
            clarity_score=report.clarity_score,
            relevance_score=report.relevance_score,
            completeness_score=report.completeness_score,
            overall_feedback=report.overall_feedback,
            strengths=report.strengths,
            improvements=report.improvements,
            questions_data=questions_data_list
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return db_report
    except Exception as e:
        db.rollback()
        print(f"Error creating interview report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save interview report: {str(e)}")


@router.get("/reports/{email}", response_model=List[InterviewReportResponse])
async def get_interview_reports(email: str, limit: int = 10, db: Session = Depends(get_db)):
    """
    Get interview reports for a candidate by email (limited to 10 by default)
    """
    try:
        reports = db.query(InterviewReport).filter(
            InterviewReport.candidate_email == email
        ).order_by(InterviewReport.created_at.desc()).limit(limit).all()
        
        return reports
    except Exception as e:
        print(f"Error fetching interview reports: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch interview reports: {str(e)}")


@router.get("/reports/{email}/latest", response_model=InterviewReportResponse)
async def get_latest_interview_report(email: str, db: Session = Depends(get_db)):
    """
    Get the most recent interview report for a candidate by email
    """
    try:
        report = db.query(InterviewReport).filter(
            InterviewReport.candidate_email == email
        ).order_by(InterviewReport.created_at.desc()).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="No interview reports found for this email")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching latest interview report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch latest interview report: {str(e)}")


@router.get("/reports/detail/{report_id}", response_model=InterviewReportResponse)
async def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    """
    Get a specific interview report by ID
    """
    try:
        report = db.query(InterviewReport).filter(
            InterviewReport.id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Debug: Check questions_data
        print(f"Retrieved report ID {report_id}")
        print(f"Questions data type: {type(report.questions_data)}")
        print(f"Questions data length: {len(report.questions_data) if report.questions_data else 0}")
        if report.questions_data:
            print(f"Sample questions_data: {report.questions_data[:2] if len(report.questions_data) > 0 else 'Empty'}")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching report by ID: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")


@router.delete("/reports/{report_id}")
async def delete_interview_report(report_id: int, db: Session = Depends(get_db)):
    """
    Delete an interview report by ID
    """
    try:
        report = db.query(InterviewReport).filter(
            InterviewReport.id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        db.delete(report)
        db.commit()
        
        return {"message": "Report deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting interview report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")


@router.get("/reports/{email}/highest-score", response_model=InterviewReportResponse)
async def get_highest_score_interview_report(email: str, db: Session = Depends(get_db)):
    """
    Get the interview report with the highest score for a candidate by email
    """
    try:
        report = db.query(InterviewReport).filter(
            InterviewReport.candidate_email == email,
            InterviewReport.overall_score.isnot(None)
        ).order_by(InterviewReport.overall_score.desc()).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="No interview reports with scores found for this email")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching highest score interview report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch highest score report: {str(e)}")

