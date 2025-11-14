# TalentSpectrum Consolidated Backend with AI Matching

This consolidated backend includes all services including AI-powered job matching.

## 🚀 Quick Start

### 1. Start the Unified Backend

```bash
cd backend/consolidated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

This single command starts ALL services:
- User authentication
- Profile management
- Job listings
- Applications
- Company profiles
- Resume extraction
- Chatbot
- Mock interviews
- **AI Matching Results Storage**
- And more...

### 2. Run AI Job Matching

With the backend running, execute the AI matching script in a **separate terminal**:

```bash
cd backend/consolidated
python ai_gem_match.py
```

## 📋 What Happens

1. **Backend Running** (`uvicorn main:app --reload`)
   - All API endpoints are available at `http://localhost:8000`
   - API documentation at `http://localhost:8000/docs`
   - Match results endpoint: `http://localhost:8000/match_results/`

2. **AI Matching Script** (`python ai_gem_match.py`)
   - Fetches all candidate profiles from `/profiles/all/candidate-profiles`
   - Fetches all job profiles from `/company/all/full_profile`
   - Uses Google Gemini AI to calculate match scores
   - Posts results to `/match_results/store_results`
   - Stores comprehensive match analysis in the database

## 📊 Available Endpoints

### Match Results Endpoints

- `POST /match_results/store_results` - Store AI match results
- `GET /match_results/all_results` - Retrieve all match results
- `GET /match_results/all_results/{job_id}` - Get matches for specific job

### Other Key Endpoints

- `GET /profiles/all/candidate-profiles` - All candidate profiles
- `GET /company/all/full_profile` - All job profiles with company data
- `POST /applications` - Submit job applications
- `GET /jobs` - Browse available jobs

## 🔑 Environment Variables Required

Create a `.env` file in `backend/consolidated/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./talentspectrum.db
```

## 📁 File Structure

```
backend/consolidated/
├── main.py                          # Main FastAPI application
├── ai_gem_match.py                  # AI matching script (run separately)
├── database/
│   ├── connection.py
│   └── models/
│       ├── match_result.py          # Match result model
│       └── ... (other models)
├── routers/
│   ├── match_result_route.py        # Match results API endpoints
│   └── ... (other routers)
├── talentspectrum.db               # SQLite database
└── README_AI_MATCHING.md           # This file
```

## 🎯 Typical Workflow

1. **Start backend**: `uvicorn main:app --reload`
2. **Candidates upload resumes** through the frontend
3. **Employers post jobs** through the frontend
4. **Run AI matching**: `python ai_gem_match.py`
5. **View match results** through API or frontend
6. **Candidates/Employers see matched recommendations**

## 🔧 Troubleshooting

### AI Matching Script Fails

- Ensure backend is running at `http://localhost:8000`
- Check that `GEMINI_API_KEY` is set in `.env`
- Verify candidate and job data exists in database

### Match Results Not Showing

- Check `/match_results/all_results` endpoint
- Verify AI matching script completed successfully
- Check database for `match_results` table

## 📝 Notes

- The AI matching is **separate from the main backend** to allow flexible scheduling
- You can run matching on-demand or set up as a cron job
- Match results are stored permanently in the database
- Upsert logic prevents duplicate matches for same candidate-job pair

## 🌟 Benefits of Consolidated Structure

✅ **Single Port**: Everything runs on port 8000
✅ **Unified Documentation**: All APIs in one place at `/docs`
✅ **Shared Database**: All services use the same SQLite database
✅ **Easy Deployment**: One command to start everything
✅ **AI Integration**: Match results seamlessly integrate with other services


