import subprocess

def generate_lipsync(face_path, audio_path, output_path):
    """
    Call Wav2Lip inference script with subprocess
    """
    command = [
        "python", "Wav2Lip/inference.py",
        "--checkpoint_path", "Wav2Lip/checkpoints/wav2lip_gan.pth",
        "--face", face_path,
        "--audio", audio_path,
        "--outfile", output_path
    ]
    subprocess.run(command, check=True)
    return output_path
