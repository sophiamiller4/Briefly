from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def voice_agent(script):
    try:
        response = client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice="onyx",
            input=script
        )
        audio_bytes = response.read() 

        path = "static/podcast.mp3"
        with open(path, "wb") as f:
            f.write(audio_bytes)

        print("Audio file generated:", path)
        return path

    except Exception as e:
        print("Voice agent error:", e)
        return None
