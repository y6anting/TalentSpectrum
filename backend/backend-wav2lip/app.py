from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse
import uvicorn
import os
import uuid
from inference import generate_lipsync

app = FastAPI()

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/generate-video")
async def generate_video(audio: UploadFile, face: UploadFile):
    # Save uploaded files
    audio_path = os.path.join(OUTPUT_DIR, f"{uuid.uuid4()}_audio.wav")
    face_path = os.path.join(OUTPUT_DIR, f"{uuid.uuid4()}_face.jpg")
    
    with open(audio_path, "wb") as f:
        f.write(await audio.read())
    with open(face_path, "wb") as f:
        f.write(await face.read())

    # Run Wav2Lip
    output_path = os.path.join(OUTPUT_DIR, f"{uuid.uuid4()}_result.mp4")
    generate_lipsync(face_path, audio_path, output_path)

    return FileResponse(output_path, media_type="video/mp4")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
