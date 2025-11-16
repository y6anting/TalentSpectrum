"""
Text-to-Speech Router using Edge TTS
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import edge_tts
import os
import uuid
from datetime import datetime

router = APIRouter()

# Audio directory for storing generated files
audio_dir = "audio_outputs"
os.makedirs(audio_dir, exist_ok=True)


class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-JennyNeural"  # Default to Jenny (US female voice)
    rate: int = 0
    volume: float = 1.0
    pitch: Optional[str] = None
    style: Optional[str] = None
    use_ssml: bool = False


async def generate_edge_tts(
    text: str,
    voice: str = "en-US-JennyNeural",  # Default to Jenny (US female voice)
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

        try:
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
        except Exception as tts_error:
            # If TTS fails, try with a fallback voice
            print(f"⚠️ TTS failed with voice {voice}, trying fallback voice: {tts_error}")
            try:
                fallback_voice = "en-US-JennyNeural" if voice != "en-US-JennyNeural" else "en-GB-SoniaNeural"
                communicate = edge_tts.Communicate(text, fallback_voice, rate=rate_str, volume=volume_str)
                await communicate.save(audio_path)
                print(f"✅ TTS succeeded with fallback voice: {fallback_voice}")
                return audio_filename
            except Exception as fallback_error:
                print(f"❌ Fallback TTS also failed: {fallback_error}")
                raise HTTPException(status_code=500, detail=f"TTS generation failed with both primary and fallback voices: {str(fallback_error)}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@router.post("/generate-edge-tts")
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


@router.get("/")
def read_root():
    return {"message": "Edge TTS Service", "status": "running"}

