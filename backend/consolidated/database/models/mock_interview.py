from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime
import json

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