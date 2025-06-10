# --- google_voice.py ---
import pyaudio
import wave
from google.cloud import speech

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 1024
RECORD_SECONDS = 5
WAVE_OUTPUT_FILENAME = "temp.wav"

def record_audio(filename=WAVE_OUTPUT_FILENAME):
    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT, channels=CHANNELS,
                    rate=RATE, input=True,
                    frames_per_buffer=CHUNK)

    print("🎤 Recording for 5 seconds...")
    frames = []
    for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)

    print("✅ Done recording.")
    stream.stop_stream()
    stream.close()
    p.terminate()

    wf = wave.open(filename, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

def transcribe_audio(filename: str) -> str:
    client = speech.SpeechClient()

    with open(filename, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(  # ✅ fixed line
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=RATE,
        language_code="en-US",
        enable_automatic_punctuation=True,
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

def voice_to_text(filename=WAVE_OUTPUT_FILENAME):
    try:
        print("🎙️ Starting voice to text...")
        record_audio(filename)
        text = transcribe_audio(filename)
        print("📝 Transcription result:", text)
        return text
    except Exception as e:
        print(f"❌ Error during voice-to-text: {e}")
        return None
