# Frontend Migration Guide

## 🔄 Migrating from Next.js API Routes to Consolidated Python Backend

This guide shows you how to update your frontend to use the new consolidated backend.

---

## 📍 API Base URL

Add this constant to your frontend code:

```typescript
// src/config/api.ts or similar
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

Then in your `.env.local` (Next.js):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🔧 API Call Updates

### Mock Interview Service

#### 1. Generate Interview Questions

**OLD (Next.js API route):**
```typescript
const response = await fetch('/api/generate-interview-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobPosition,
    interviewType,
    numberOfQuestions
  })
});
```

**NEW (Consolidated Backend):**
```typescript
const response = await fetch(`${API_BASE_URL}/mock-interview/generate-interview-questions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobPosition,
    interviewType,
    numberOfQuestions
  })
});
```

---

#### 2. Mock Interview Feedback

**OLD:**
```typescript
await fetch('/api/MockInterviewFeedback', { ... })
```

**NEW:**
```typescript
await fetch(`${API_BASE_URL}/mock-interview/mock-interview-feedback`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobPosition,
    interviewType,
    answers
  })
});
```

---

#### 3. Speech Transcription

**OLD:**
```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'recording.webm');

await fetch('/api/MockInterviewTranscription', {
  method: 'POST',
  body: formData
});
```

**NEW:**
```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'recording.webm');

await fetch(`${API_BASE_URL}/mock-interview/mock-interview-transcription`, {
  method: 'POST',
  body: formData
});
```

---

#### 4. Text-to-Speech (Edge TTS)

**OLD:**
```typescript
await fetch('/api/edge-tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text,
    voice,
    rate,
    volume
  })
});
```

**NEW:**
```typescript
await fetch(`${API_BASE_URL}/tts/generate-edge-tts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text,
    voice,
    rate,
    volume
  })
});
```

---

### Resume Feedback

**OLD:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

await fetch('/api/ResumeFeedback', {
  method: 'POST',
  body: formData
});
```

**NEW:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

await fetch(`${API_BASE_URL}/resume/resume-feedback`, {
  method: 'POST',
  body: formData
});
```

---

### Profiles

**OLD:**
```typescript
await fetch('/api/profiles/test@example.com')
```

**NEW:**
```typescript
await fetch(`${API_BASE_URL}/profiles/test@example.com`)
```

---

### Jobs

**OLD:**
```typescript
await fetch('/api/jobs')
await fetch('/api/jobs/employer/employer@company.com')
```

**NEW:**
```typescript
await fetch(`${API_BASE_URL}/jobs`)
await fetch(`${API_BASE_URL}/jobs/employer/employer@company.com`)
```

---

### Applications

**OLD:**
```typescript
await fetch('/api/applications/apply', {
  method: 'POST',
  body: JSON.stringify({ candidate_email, job_id, accommodations_requested })
})
```

**NEW:**
```typescript
await fetch(`${API_BASE_URL}/applications/apply`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidate_email, job_id, accommodations_requested })
})
```

---

## 📝 Updated `interviewService.ts`

Replace your `talent-spectrum-app/src/app/candidate/candidate-dashboard/mock-interview/interviewService.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function generateInterviewQuestions(
  jobPosition: JobPosition,
  interviewType: 'general' | 'technical' | 'behavioral',
  numberOfQuestions: number = 2
): Promise<InterviewQuestion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/mock-interview/generate-interview-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobPosition,
        interviewType,
        numberOfQuestions
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.questions || [];
    
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function generateSpeechFromText(
  text: string,
  voice: string = "en-US-AriaNeural",
  rate: number = 0,
  volume: number = 1.0
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/tts/generate-edge-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, rate, volume })
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve('speech-completed');
      };
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  } catch (error) {
    console.warn('TTS failed:', error);
    return 'speech-completed';
  }
}

export async function transcribeVoiceToText(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    const response = await fetch(`${API_BASE_URL}/mock-interview/mock-interview-transcription`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }
    
    return data.text?.trim() || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

export async function generateAIFeedback(
  jobPosition: JobPosition,
  interviewType: 'general' | 'technical' | 'behavioral',
  answers: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/mock-interview/mock-interview-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobPosition,
        interviewType,
        answers: answers.map(a => ({
          question: a.question,
          answer: a.answer,
          timestamp: a.timestamp
        }))
      })
    });
    
    if (!response.ok) {
      throw new Error(`Feedback API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.feedback || 'Thank you for completing the interview!';
    
  } catch (error) {
    console.error('Error requesting feedback:', error);
    return 'Thank you for completing the interview! Keep practicing.';
  }
}
```

---

## 🚀 Testing the Migration

### 1. Start the Backend

```bash
cd backend/consolidated
uvicorn main:app --reload
```

### 2. Start the Frontend

```bash
cd talent-spectrum-app
npm run dev
```

### 3. Test Each Feature

- ✅ Mock interview question generation
- ✅ Speech transcription
- ✅ AI feedback
- ✅ Text-to-speech
- ✅ Resume feedback
- ✅ Profile CRUD
- ✅ Job listings
- ✅ Applications

---

## 🔧 CORS Configuration

The consolidated backend is configured to accept requests from any origin during development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**For production**, update `main.py`:

```python
allow_origins=[
    "https://your-production-domain.com",
    "https://www.your-production-domain.com"
],
```

---

## 📋 Checklist

- [ ] Update `API_BASE_URL` in frontend config
- [ ] Add `NEXT_PUBLIC_API_URL` to `.env.local`
- [ ] Update all API calls to use new endpoints
- [ ] Test mock interview flow
- [ ] Test resume feedback
- [ ] Test profile management
- [ ] Test job applications
- [ ] Remove old Next.js API route files (optional)

---

## 🎉 Benefits After Migration

✅ **Faster development** - No more switching between Next.js and Python servers  
✅ **Better performance** - Direct Python backend without Next.js proxy  
✅ **Easier debugging** - All logs in one place  
✅ **Simplified deployment** - One backend to deploy  
✅ **Type safety** - Pydantic models ensure data validation  

---

## 🐛 Common Issues

### Issue: CORS Error

**Solution**: Ensure backend is running and CORS is properly configured in `main.py`

### Issue: 404 Not Found

**Solution**: Check that:
1. Backend is running on port 8000
2. API endpoint path is correct (e.g., `/mock-interview/` not `/api/mock-interview/`)
3. `API_BASE_URL` is properly set

### Issue: "API key not configured"

**Solution**: Ensure `.env` file in backend has the required API keys

---

## 📞 Need Help?

Check the main `README.md` for:
- Backend setup instructions
- API documentation
- Troubleshooting tips

