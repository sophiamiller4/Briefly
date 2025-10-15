# Briefly
A personalized AI-powered podcast generator — users pick their interests and preferred podcast length, and the app creates a custom “Daily”-style audio summary of relevant news.

Built with:
- **FastAPI** (Python backend)
- **OpenAI + Tavily APIs** for news, summarization, and TTS
- **React + TypeScript + Tailwind CSS** frontend

---

## Features

- Choose topics from a recommended list **or** type your own.
- Watch real-time progress as each step completes:
  - Cleaning and normalizing topics
  - Fetching relevant news
  - Summarizing articles
  - Writing script
  - Generating spoken podcast
- Streamed updates with Server-Sent Events (SSE).
- Playback directly in-app via an integrated audio player.

---

## Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **npm** or **yarn**
- OpenAI API key
- Tavily API key

---

## Setup Instructions

###  Clone the repo

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### Backend Setup

cd backend
python -m venv venv
source venv/bin/activate   # (on Mac/Linux)
venv\Scripts\activate      # (on Windows)

pip install -r requirements.txt

create a .env file inside /backend with these contents:
OPENAI_API_KEY=your_openai_key
TAVILY_API_KEY=your_tavily_key

Run the backend:
uvicorn main:app --reload

The server will start at http://127.0.0.1:8000

### Frontend Setup
In a new terminal (keep backend running):
cd frontend
npm install
npm run dev

The frontend will start at http://localhost:5173