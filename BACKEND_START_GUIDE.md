# TalentSpectrum Backend Setup & CORS Fix

## Issues Fixed

1. **CORS Issue**: Frontend components were making direct requests to `http://127.0.0.1:8000` instead of using Next.js API routes
2. **API Routes**: Created missing `/api/profiles` route to handle profile updates
3. **Component Updates**: Updated `NeuroStrengthSubmission` and `EnvironmentSubmission` to use API routes

## Files Changed

### Backend
- `backend/consolidated/main.py` - Enhanced CORS configuration with `expose_headers`

### Frontend
- `talent-spectrum-app/src/app/api/profiles/route.ts` - **NEW FILE** - API route for profile operations
- `talent-spectrum-app/src/app/candidate/components/NeuroStrengthSubmission.tsx` - Updated to use API route
- `talent-spectrum-app/src/app/candidate/components/EnvironmentSubmission.tsx` - Updated to use API route

## How to Start the Backend

### Option 1: Using the batch file (Windows)
```bash
cd backend/consolidated
start_backend.bat
```

### Option 2: Using PowerShell
```powershell
cd backend\consolidated
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 3: Using Python directly
```bash
cd backend/consolidated
python main.py
```

## How to Start the Frontend

```bash
cd talent-spectrum-app
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://127.0.0.1:8000`

## Testing the Fixes

1. **Test Neurodivergent Strengths**:
   - Go to candidate dashboard
   - Navigate to "Neurodivergent Strengths" tab
   - Select strengths and click "Save Strengths"
   - Should save successfully without CORS errors

2. **Test Environment Settings**:
   - Go to candidate dashboard
   - Navigate to "Preferred Environment" tab
   - Fill in preferences and click "Save Environment"
   - Should save successfully without CORS errors

3. **Test Job Operations**:
   - Go to Job Listing page
   - Click "Apply" on any job - should work
   - Click "Save Job" - should work
   - Click "Saved" again to unsave - should work

## API Routes Structure

All frontend requests now go through Next.js API routes which proxy to the backend:

```
Frontend → Next.js API Routes → FastAPI Backend
localhost:3000 → localhost:3000/api/* → 127.0.0.1:8000
```

This eliminates CORS issues since the frontend only talks to its own server.

## Backend Endpoints

### Profile Endpoints
- `GET /profiles/{email}` - Get profile by email
- `POST /profiles/` - Create profile
- `PUT /profiles/{email}` - Update entire profile
- `PATCH /profiles/{email}/neurodivergent_strengths` - Update strengths
- `PATCH /profiles/{email}/environment` - Update environment
- `PATCH /profiles/{email}/personal_identifiers` - Update personal info
- `PATCH /profiles/{email}/education` - Update education
- `PATCH /profiles/{email}/experience` - Update experience
- `PATCH /profiles/{email}/language_proficiencies` - Update languages

### Job Application Endpoints
- `POST /applications/apply` - Apply to a job
- `GET /applications/applications/{email}` - Get applications
- `POST /applications/save` - Save a job
- `GET /applications/saved/{email}` - Get saved jobs
- `DELETE /applications/saved/{id}` - Remove saved job

### Jobs Endpoints
- `GET /jobs` - Get all jobs
- `GET /jobs/{id}` - Get job by ID

## Environment Variables

Make sure you have a `.env.local` file in the `talent-spectrum-app` directory:

```env
BACKEND_URL=http://127.0.0.1:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## Troubleshooting

### Backend won't start
1. Check if Python dependencies are installed:
   ```bash
   cd backend\consolidated
   pip install -r requirements.txt
   ```

2. Check if port 8000 is already in use:
   ```powershell
   netstat -ano | findstr :8000
   ```

3. If port is in use, kill the process or use a different port:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```
   Then update `BACKEND_URL` in frontend `.env.local`

### CORS errors still appearing
1. Make sure backend is running
2. Clear browser cache and cookies
3. Check that components are using `/api/*` routes, not direct `http://127.0.0.1:8000` calls
4. Restart both backend and frontend

### Database errors
1. Check if database exists:
   ```bash
   cd backend\consolidated
   ls -la talentspectrum.db
   ```

2. If missing, the backend should create it automatically on startup
3. Check database connection in `backend/consolidated/database/connection.py`

## Next Steps

1. Start the backend server
2. Start the frontend server
3. Test the profile updates (neurodivergent strengths, environment)
4. Test job operations (apply, save, unsave)

All CORS issues should now be resolved!




