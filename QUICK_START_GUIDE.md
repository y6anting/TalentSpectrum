# 🚀 Quick Start Guide - Resume Upload & AI Matching

## ⚡ Quick Commands

### Start Everything:
```bash
# Terminal 1: Backend
cd backend/consolidated
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend  
cd talent-spectrum-app
npm run dev
```

---

## 📝 User Flow - Resume Upload

1. **Login** → Candidate account
2. **Dashboard** → Click "Upload Resume" (top right)
3. **Select PDF** → Choose your resume file
4. **Wait** → See "Processing resume..." toast
5. **Success!** → See toast with profile completion %
6. **View Data** → Go to `Profile Settings` → `Profile Data`
7. **Done!** → All your info is displayed and editable

---

## 🤖 AI Matching - Get Job Scores

### Option 1: API Call
```bash
curl -X POST http://localhost:8000/ai-matching/run_matching
```

### Option 2: Check Status
```bash
curl http://localhost:8000/ai-matching/status
```

### View Match Results:
```bash
# All results
curl http://localhost:8000/match_results/all_results

# For specific job
curl http://localhost:8000/match_results/all_results/1
```

---

## 📍 Key URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Dashboard:** http://localhost:3000/candidate/candidate-dashboard

---

## 🔥 Quick Test

```bash
# 1. Login as candidate
# 2. Upload a resume PDF
# 3. Check toast notification
# 4. Go to Profile Settings → Profile Data
# 5. Verify data is displayed

# Run AI Matching:
curl -X POST http://localhost:8000/ai-matching/run_matching

# View your match scores:
curl http://localhost:8000/match_results/all_results | json_pp
```

---

## 🎯 What's Working

✅ Upload Resume button  
✅ PDF parsing (Google Gemini AI)  
✅ Save to database (create/overwrite)  
✅ Toast notifications  
✅ Profile data display  
✅ AI matching  
✅ Job scoring  

---

## 💡 Tips

- **422 Error?** → Make sure backend is running on port 8000
- **No toast?** → Check browser console for errors
- **Data not showing?** → Refresh page after upload
- **AI matching not working?** → Set GEMINI_API_KEY in backend/.env

---

## 🆘 Troubleshooting

**Problem:** Resume upload fails
**Solution:** Check backend logs, ensure GEMINI_API_KEY is set

**Problem:** Data not displaying in Profile Settings
**Solution:** Check if candidate_email matches logged-in user

**Problem:** Toast notifications not showing
**Solution:** Verify react-hot-toast is installed: `npm install react-hot-toast`

**Problem:** AI matching returns error
**Solution:** Ensure you have candidate profiles and job postings in database

---

That's it! 🎉 Everything is ready to use!

