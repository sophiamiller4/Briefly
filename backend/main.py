from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from graph import run_pipeline
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json, asyncio, os
from agents.topic_router import topic_router
from agents.retriever import retriever
from agents.extractor import extractor
from agents.summarizer import summarizer
from agents.synthesizer import synthesizer
from agents.voice_agent import voice_agent

# initialize app
app = FastAPI()


# allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#create static folder for storing audio
if not os.path.exists("static"):
    os.mkdir("static")
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class TopicsRequest(BaseModel):
    topics: list[str]

#endpoint for creating podcast
@app.post("/generate")
async def generate(data: TopicsRequest):
    topics = data.topics
    result = run_pipeline(topics)
    return result

#endpoint for creating podcast with streaming updates
@app.post("/generate-stream")
async def generate_stream(req: TopicsRequest):
    topics = req.topics

    async def event_generator():
        try:
            yield f"data: {json.dumps({'step': 'Compiling topics...'})}\n\n"
            await asyncio.sleep(0.1)
            routed = topic_router(topics)

            yield f"data: {json.dumps({'step': 'Retrieving relevant news...'})}\n\n"
            await asyncio.sleep(0.1)
            news = retriever(routed)

            yield f"data: {json.dumps({'step': 'Extracting insights from articles...'})}\n\n"
            await asyncio.sleep(0.1)
            extractions = extractor(news)

            yield f"data: {json.dumps({'step': 'Summarizing stories...'})}\n\n"
            await asyncio.sleep(0.1)
            summaries = summarizer(extractions)

            yield f"data: {json.dumps({'step': 'Writing script...'})}\n\n"
            await asyncio.sleep(0.1)
            script = synthesizer(summaries, routed)

            yield f"data: {json.dumps({'step': 'Generating podcast audio...'})}\n\n"
            await asyncio.sleep(0.1)
            audio_path = voice_agent(script)

            yield f"data: {json.dumps({'done': True, 'script': script, 'audio_path': audio_path})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")