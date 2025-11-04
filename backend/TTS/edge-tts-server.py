"""
Edge TTS FastAPI Server
This server provides the /generate-edge-tts endpoint that matches the Python function signature.
Add this to your existing FastAPI app or run as standalone server.
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import edge_tts
import os
import uuid
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audio directory for storing generated files
audio_dir = "audio_outputs"
os.makedirs(audio_dir, exist_ok=True)


class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    rate: int = 0
    volume: float = 1.0
    pitch: Optional[str] = None
    style: Optional[str] = None
    use_ssml: bool = False


async def generate_edge_tts(
    text: str,
    voice: str = "en-US-AriaNeural",
    rate: int = 0,
    volume: float = 1.0,
    pitch: str = None,
    style: str = None,
    use_ssml: bool = False
) -> str:
    """Generate TTS audio using Edge TTS"""
    try:
        rate_str = f"{rate:+d}%"
        volume_percent = int((volume - 1.0) * 100)
        volume_str = f"{volume_percent:+d}%"

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
        unique_id = str(uuid.uuid4())[:8]
        audio_filename = f"tts_audio_{timestamp}_{unique_id}.mp3"
        audio_path = os.path.join(audio_dir, audio_filename)

        if use_ssml:
            ssml_parts = [
                f'<speak version="1.0" xml:lang="en-US">',
                f'<voice name="{voice}">'
            ]
            if style:
                ssml_parts.append(f'<mstts:express-as style="{style}">')
            prosody_attrs = [f'rate="{rate_str}"', f'volume="{volume_str}"']
            if pitch:
                prosody_attrs.append(f'pitch="{pitch}"')
            ssml_parts.append(f'<prosody {" ".join(prosody_attrs)}>{text}</prosody>')
            if style:
                ssml_parts.append('</mstts:express-as>')
            ssml_parts.append('</voice></speak>')

            ssml = "".join(ssml_parts)
            communicate = edge_tts.Communicate(ssml, voice)
        else:
            communicate = edge_tts.Communicate(text, voice, rate=rate_str, volume=volume_str)

        await communicate.save(audio_path)

        if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
            raise HTTPException(status_code=500, detail="Failed to generate audio file")

        return audio_filename

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@app.post("/generate-edge-tts")
async def generate_tts_endpoint(request: TTSRequest):
    """Endpoint to generate TTS audio using Edge TTS"""
    try:
        audio_filename = await generate_edge_tts(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch,
            style=request.style,
            use_ssml=request.use_ssml
        )

        audio_path = os.path.join(audio_dir, audio_filename)

        # Return the audio file
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename=audio_filename,
            headers={
                "X-Audio-Filename": audio_filename
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@app.get("/")
def read_root():
    return {"message": "Edge TTS Server", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

