# ✅ Email-Based Profile Flow - Complete Implementation

## 🎯 Overview

The system now properly stores and retrieves candidate profile data using email as the unique identifier. When users upload a resume, their email is stored, and this email is used to retrieve their profile data across all pages (Profile Settings, Dashboard, Report). On relogin, the system automatically fetches their data using the email from the session.

---

## 📊 Complete Data Flow

```
┌─────────────────┐
│  User Login     │
│  (NextAuth)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Email stored in session     │
│ session.user.email          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Resume Upload                       │
│ 1. Upload PDF                       │
│ 2. Parse with AI                    │
│ 3. Extract data                     │
│ 4. Set candidate_email = session    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Save to Database                    │
│ POST /resume-save/save_parsed_resume│
│ - candidate_profiles (by email)     │
│ - educations (by email FK)          │
│ - experiences (by email FK)         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Retrieve Profile Data               │
│ GET /profiles/{email}               │
│ - Personal info                     │
│ - Education records                 │
│ - Experience records                │
│ - Skills                            │
│ - Languages                         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Display in Pages                    │
│ 1. Profile Settings Tab             │
│ 2. Candidate Dashboard              │
│ 3. Report Page                      │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ User Logs Out / Relogins            │
│ - Email persists in database        │
│ - On next login, auto-fetch by email│
│ - All data displays automatically   │
└─────────────────────────────────────┘
```

---

## 🔧 Implementation Details

### 1. Backend: Resume Save Router

**File:** `backend/consolidated/routers/resume_save.py`

**Key Features:**
- ✅ Uses `candidate_email` as unique identifier
- ✅ Upsert logic (create new or update existing)
- ✅ Saves to multiple tables:
  - `candidate_profiles` - Main profile data
  - `educations` - Separate education records (FK: candidate_email)
  - `experiences` - Separate experience records (FK: candidate_email)
- ✅ Calculates profile completion percentage
- ✅ Returns success status with profile details

**Endpoint:**
```python
POST /resume-save/save_parsed_resume

Body: {
  "candidate_email": "user@example.com",  # ✅ Email as unique ID
  "name": "John Doe",
  "personal_identifiers": {...},
  "education": [...],
  "experience": [...],
  "skills": {...},
  ...
}

Response: {
  "status": "success",
  "action": "created" | "updated",
  "candidate_email": "user@example.com",
  "profile_id": 123,
  "profile_completion": 85
}
```

---

### 2. Frontend: API Route Proxy

**File:** `talent-spectrum-app/src/app/api/resume-save/save/route.ts`

**Purpose:** Proxy requests from frontend to backend

**Key Features:**
- ✅ Validates email is present before sending
- ✅ Logs email being processed
- ✅ Error handling with detailed messages

**Flow:**
```
Frontend → /api/resume-save/save → Backend /resume-save/save_parsed_resume
```

---

### 3. Profile Settings Tab

**File:** `talent-spectrum-app/src/app/candidate/candidate-dashboard/components/ProfileSettingsTab.tsx`

**Key Features:**
- ✅ Gets email from props (from parent dashboard)
- ✅ Fetches profile on mount using email
- ✅ On resume upload, ensures email is set
- ✅ Waits 1.5s after save for DB commit
- ✅ Auto-refreshes profile data
- ✅ Displays all saved data

**Code:**
```typescript
// Fetch profile on mount
useEffect(() => {
  if (candidateEmail) {
    fetchProfileData();  // Uses candidateEmail prop
  }
}, [candidateEmail]);

// On resume upload
parsedInfo.candidate_email = candidateEmail;  // ✅ Set email from session
if (parsedInfo.personal_identifiers) {
  parsedInfo.personal_identifiers.emailAddress = candidateEmail;
}

// Save and refresh
await fetch('/api/resume-save/save', {
  method: 'POST',
  body: JSON.stringify(parsedInfo),
});

await new Promise(resolve => setTimeout(resolve, 1500));  // Wait for DB
await fetchProfileData();  // Refresh data
```

---

### 4. Candidate Dashboard

**File:** `talent-spectrum-app/src/app/candidate/candidate-dashboard/page.tsx`

**Key Features:**
- ✅ Gets email from NextAuth session on mount
- ✅ Passes email to ProfileSettingsTab
- ✅ Fetches profile data on load
- ✅ Auto-refreshes after resume upload

**Code:**
```typescript
const { data: session } = useSession();

// Fetch on mount
useEffect(() => {
  fetchProfileData();  // Uses session?.user?.email
}, [status, session]);

// Pass to child component
<ProfileSettingsTab 
  candidateEmail={candidateProfile.email || session?.user?.email || ""} 
  onUploadSuccess={() => {
    fetchProfileData();  // Refresh after upload
  }}
/>
```

---

### 5. Report Page

**File:** `talent-spectrum-app/src/app/candidate/candidate-dashboard/Report/page.tsx`

**Key Features:**
- ✅ Gets email from NextAuth session
- ✅ Fetches profile data on mount
- ✅ Fetches mock interview data by email
- ✅ Displays all data in report

**Code:**
```typescript
useEffect(() => {
  const loadReportData = async () => {
    if (authSession?.user?.email) {
      const userEmail = authSession.user.email;
      
      // Fetch profile data
      const profileResponse = await fetch(
        `${backendUrl}/profiles/${encodeURIComponent(userEmail)}`
      );
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setProfileData(profile);  // ✅ Store for display
      }
      
      // Fetch mock interview data
      const response = await fetch(
        `/api/mock-interview/reports/latest?email=${encodeURIComponent(userEmail)}`
      );
      // ... process response
    }
  };
  
  loadReportData();
}, [authSession]);
```

---

## 🔄 Relogin Flow

### What Happens on Relogin:

1. **User logs in with NextAuth**
   - Email stored in `session.user.email`

2. **Dashboard loads**
   - `useEffect` triggers
   - Calls `fetchProfileData()`
   - Uses `session.user.email` to query backend

3. **Backend retrieves data**
   ```sql
   SELECT * FROM candidate_profiles WHERE candidate_email = 'user@example.com';
   SELECT * FROM educations WHERE candidate_email = 'user@example.com';
   SELECT * FROM experiences WHERE candidate_email = 'user@example.com';
   ```

4. **Frontend displays data**
   - Profile Settings Tab shows personal info, education, experience
   - Dashboard shows profile completion %
   - Report page shows comprehensive report

5. **All data persists across sessions** ✅

---

## 📝 Files Created/Modified

### Backend Files:
1. ✅ **Created:** `backend/consolidated/routers/resume_save.py`
   - Resume save endpoint with email-based logic
   - Upsert functionality
   - Profile completion calculation

2. ✅ **Modified:** `backend/consolidated/routers/__init__.py`
   - Added `resume_save` import

3. ✅ **Modified:** `backend/consolidated/main.py`
   - Imported `resume_save` router
   - Registered router: `/resume-save` prefix
   - Added to services list

### Frontend Files:
4. ✅ **Created:** `talent-spectrum-app/src/app/api/resume-save/save/route.ts`
   - API proxy with email validation

5. ✅ **Modified:** `talent-spectrum-app/src/app/candidate/candidate-dashboard/components/ProfileSettingsTab.tsx`
   - Email-based data fetching
   - Auto-refresh after upload

6. ✅ **Modified:** `talent-spectrum-app/src/app/candidate/candidate-dashboard/Report/page.tsx`
   - Added profile data fetching by email
   - Displays profile data in report

---

## ✅ Success Criteria

### On Resume Upload:
- [x] Email is captured from session
- [x] Email is set in parsed data
- [x] Data saved to database with email as key
- [x] Profile data auto-refreshes after save
- [x] All fields display correctly

### On Profile Settings Page:
- [x] Fetches data by email from session
- [x] Displays personal information
- [x] Displays education records
- [x] Displays experience records
- [x] Displays skills and languages
- [x] Shows profile completion %

### On Report Page:
- [x] Fetches profile data by email
- [x] Fetches mock interview data by email
- [x] Displays comprehensive report
- [x] All data from database

### On Relogin:
- [x] Email persists in session
- [x] Profile data auto-fetched by email
- [x] All data displays automatically
- [x] No data loss between sessions
- [x] Works across all pages

---

## 🚀 Testing Guide

### Test 1: Resume Upload
```bash
1. Login as candidate
2. Go to Dashboard → Profile Settings → Profile Data
3. Upload resume PDF
4. ✅ Verify: Success message with profile completion %
5. ✅ Verify: Data displays within 2 seconds
6. ✅ Verify: Check database:
   SELECT * FROM candidate_profiles WHERE candidate_email = 'user@example.com';
```

### Test 2: Data Persistence
```bash
1. Upload resume (as above)
2. Logout
3. Close browser
4. Login again
5. Go to Dashboard
6. ✅ Verify: Profile data loads automatically
7. ✅ Verify: Profile completion % shows
8. Go to Profile Settings
9. ✅ Verify: All data is displayed
```

### Test 3: Report Page
```bash
1. Login as candidate (with profile data)
2. Go to Dashboard → Job Coach → Report
3. ✅ Verify: Profile data section appears
4. ✅ Verify: Personal info displayed
5. ✅ Verify: Mock interview data displayed (if available)
6. ✅ Verify: Console logs show: "Profile data loaded for report"
```

### Test 4: Multiple Sessions
```bash
1. Login on Browser 1
2. Upload resume
3. Logout
4. Login on Browser 2 (same account)
5. ✅ Verify: Same data appears
6. Update profile on Browser 2
7. Logout and login on Browser 1
8. ✅ Verify: Updated data appears
```

---

## 🔍 Database Schema

### candidate_profiles Table:
```sql
CREATE TABLE candidate_profiles (
    id INTEGER PRIMARY KEY,
    candidate_email VARCHAR UNIQUE NOT NULL,  -- ✅ Unique identifier
    name VARCHAR,
    location VARCHAR,
    profile_completion INTEGER,
    personal_identifiers JSON,
    skills JSON,
    environment JSON,
    language_proficiencies JSON,
    neurodivergent_strengths JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### educations Table:
```sql
CREATE TABLE educations (
    id INTEGER PRIMARY KEY,
    candidate_email VARCHAR NOT NULL,  -- ✅ Foreign key
    level VARCHAR,
    field_of_study VARCHAR,
    institution VARCHAR,
    graduation_year INTEGER,
    cgpa_grade VARCHAR,
    award VARCHAR,
    created_at TIMESTAMP,
    FOREIGN KEY (candidate_email) REFERENCES candidate_profiles(candidate_email)
);
```

### experiences Table:
```sql
CREATE TABLE experiences (
    id INTEGER PRIMARY KEY,
    candidate_email VARCHAR NOT NULL,  -- ✅ Foreign key
    employer VARCHAR,
    title VARCHAR,
    industry VARCHAR,
    start_date VARCHAR,
    end_date VARCHAR,
    seniority_level VARCHAR,
    skills_tools_used VARCHAR,
    project_highlights TEXT,
    achievements TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (candidate_email) REFERENCES candidate_profiles(candidate_email)
);
```

---

## 💡 Key Features

1. **Email as Unique Identifier**
   - ✅ One profile per email
   - ✅ Easy to query and update
   - ✅ Consistent across all tables

2. **Session-Based Email**
   - ✅ Email from NextAuth session
   - ✅ Auto-fetched on login
   - ✅ No manual email entry needed

3. **Automatic Data Refresh**
   - ✅ After resume upload
   - ✅ On page load
   - ✅ On relogin

4. **Cross-Page Consistency**
   - ✅ Same email used everywhere
   - ✅ Dashboard, Profile Settings, Report all show same data
   - ✅ Real-time updates

5. **Data Persistence**
   - ✅ Stored in PostgreSQL/SQLite
   - ✅ Survives logout/relogin
   - ✅ Available across devices

---

## 🎉 Complete!

The email-based profile flow is fully implemented:

✅ Email stored on resume upload  
✅ Email used to fetch profile data  
✅ Data displayed in Profile Settings  
✅ Data displayed in Report page  
✅ Data persists across sessions  
✅ Automatic data retrieval on relogin  
✅ Consistent email usage across all pages  

Users can now upload their resume once, and all their data will be automatically retrieved and displayed every time they login!

