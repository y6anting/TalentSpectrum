# 🔍 Debug Resume Extractor

## ✅ Changes Made:

1. ✅ Added file validation (checks for .pdf extension)
2. ✅ Added proper directory creation
3. ✅ Added detailed error logging
4. ✅ Added Gemini API safety settings
5. ✅ Added response validation

## 🚀 How to Test:

### Step 1: Restart the Server
```bash
cd backend\consolidated
# Stop the current server (Ctrl+C)
uvicorn main:app --reload
```

### Step 2: Watch the Console
When you upload a PDF, you'll see detailed error messages if something goes wrong.

### Step 3: Try Uploading Again
Upload a PDF resume from your frontend.

---

## 🔎 Common Issues & Solutions:

### Issue 1: "AI service not configured"
**Error**: `AI service not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY in .env file`

**Solution**:
```bash
# Check if .env file exists in backend/consolidated/
# Make sure it has:
GOOGLE_API_KEY=your_actual_api_key_here
# OR
GEMINI_API_KEY=your_actual_api_key_here
```

### Issue 2: "No filename provided"
**Error**: `400: No filename provided`

**Solution**: This is a frontend issue - make sure the file is being sent correctly.

### Issue 3: "Only PDF files are supported"
**Error**: `400: Only PDF files are supported`

**Solution**: Make sure you're uploading a .pdf file.

### Issue 4: Gemini API Error
**Error**: `AI processing failed: ...`

**Solution**: 
- Check your API key is valid
- Check your API quota
- Check the console for detailed error message

---

## 📝 Check Server Console

After restarting the server, you should see:

```
✅ Google Gemini initialized for resume extraction
✅ Database tables created successfully
📚 API Documentation: http://localhost:8000/docs
```

If you see:
```
⚠️ Warning: Failed to initialize Gemini: ...
```

Then your API key is not configured correctly.

---

## 🧪 Test Endpoint Directly:

### Test with curl:
```bash
curl -X POST http://localhost:8000/resume-extractor/upload_pdf \
  -F "file=@path/to/resume.pdf" \
  -v
```

This will show you the exact error response.

### Test in API Docs:
1. Go to http://localhost:8000/docs
2. Find "Resume Extractor" section
3. Click on `/resume-extractor/upload_pdf`
4. Click "Try it out"
5. Upload a PDF
6. See the detailed response

---

## 🔍 What to Look For:

When you try to upload, check the **server console** for these messages:

✅ **Success**:
```
INFO: 127.0.0.1:xxxxx - "POST /resume-extractor/upload_pdf HTTP/1.1" 200 OK
```

❌ **Error** (will show detailed traceback):
```
❌ Resume extraction error: [detailed traceback]
ERROR: Exception in ASGI application
```

**Copy the error message and send it to me!**

---

## 💡 Quick Fix Checklist:

- [ ] Server is running on port 8000
- [ ] .env file exists with GOOGLE_API_KEY or GEMINI_API_KEY
- [ ] PDF file is valid (not corrupted)
- [ ] Frontend is sending to `http://localhost:8000/resume-extractor/upload_pdf`
- [ ] File is included in the request as multipart/form-data

---

## 🆘 Still Getting 500 Error?

**Please check the server console and send me:**
1. The full error traceback (between the ❌ marks)
2. Any warning messages
3. The startup messages when the server starts

This will help me identify the exact issue!

