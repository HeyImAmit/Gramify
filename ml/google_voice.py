# --- google_voice.py ---
from google.cloud import speech

RATE = 16000  # Must match the converted audio sample rate

def transcribe_audio(filename: str) -> str:
    """
    Transcribes the given WAV audio file using Google Cloud Speech-to-Text API.
    Assumes audio is 16kHz, LINEAR16 PCM WAV.
    """
    client = speech.SpeechClient()

    with open(filename, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=RATE,
        language_code="en-US",
        enable_automatic_punctuation=True,  # Optional: adds punctuation to transcript
    )

    print("🧠 Transcribing with Google Cloud...")
    response = client.recognize(config=config, audio=audio)

    if not response.results:
        print("⚠️ No speech detected in the audio.")
        return ""

    transcripts = [result.alternatives[0].transcript for result in response.results]
    combined_transcript = " ".join(transcripts)
    print("Transcript:", combined_transcript)
    return combined_transcript

