import os
from dotenv import load_dotenv
load_dotenv()
from agents.topic_router import topic_router
from agents.retriever import retriever
from agents.extractor import extractor
from agents.summarizer import summarizer
from agents.synthesizer import synthesizer
from agents.voice_agent import voice_agent

def run_pipeline(topics):
    # Route topics
    routed = topic_router(topics)
    # Retrieve URLs
    urls = retriever(routed)
    # Extract article text
    extracted = extractor(urls)
    # Summarize
    summaries = summarizer(extracted)
    # Synthesize podcast script
    script = synthesizer(summaries,topics)
    # Create voice output
    audio_path = voice_agent(script)
    return {"script": script, "audio_path": audio_path}
