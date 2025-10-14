from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from graph import run_pipeline
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os

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


# serve static files (generated audio)
if not os.path.exists("static"):
    os.mkdir("static")

app.mount("/static", StaticFiles(directory="."), name="static")

class TopicsRequest(BaseModel):
    topics: list[str]
    length: int = 20

#endpoint for creating podcast
@app.post("/generate")
async def generate(data: TopicsRequest):
    topics = data.topics
    length = data.length
    result = run_pipeline(topics, length)
    return result
