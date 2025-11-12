// API Configuration for TalentSpectrum
// Consolidated backend running on port 8000

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
console.log("🔌 Connected to API Base URL:", API_BASE_URL);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  
  // Profiles
  PROFILES: `${API_BASE_URL}/profiles`,
  
  // Jobs
  JOBS: `${API_BASE_URL}/jobs`,
  COMPANY: `${API_BASE_URL}/jobs/company`,
  
  // Applications
  APPLICATIONS: `${API_BASE_URL}/applications`,
  APPLY: `${API_BASE_URL}/applications/apply`,
  SAVED_JOBS: `${API_BASE_URL}/applications/saved`,
  
  // Company
  EMPLOYER_PROFILES: `${API_BASE_URL}/company/all/employer-profiles`,
  
  // AI Services
  CHATBOT: `${API_BASE_URL}/chat`,
  RESUME_FEEDBACK: `${API_BASE_URL}/resume/resume-feedback`,
  RESUME_SUMMARY: `${API_BASE_URL}/resume/resume-summary`,
  RESUME_EXTRACTOR: `${API_BASE_URL}/resume-extractor/upload_pdf`,
  TTS: `${API_BASE_URL}/tts/generate-edge-tts`,
  MOCK_INTERVIEW_QUESTIONS: `${API_BASE_URL}/mock-interview/generate-interview-questions`,
  MOCK_INTERVIEW_FEEDBACK: `${API_BASE_URL}/mock-interview/mock-interview-feedback`,
  MOCK_INTERVIEW_TRANSCRIPTION: `${API_BASE_URL}/mock-interview/mock-interview-transcription`,
  TRAINERBOOK: `${API_BASE_URL}/trainerbook/ask`,
} as const;

export default API_BASE_URL;

