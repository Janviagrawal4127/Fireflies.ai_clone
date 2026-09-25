import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import models  # noqa: F401 — registers all ORM models with Base
from app.routers import meetings, transcripts, summaries, action_items, search

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies Clone API",
    version="1.0.0",
    description="Meeting notes and transcription platform API",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Safely parse FRONTEND_URL
raw_frontend_url = os.getenv("FRONTEND_URL", "")
frontend_urls = [url.strip().rstrip("/") for url in raw_frontend_url.split(",")] if raw_frontend_url else []

allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://fireflies-ai-clone-u4h4.vercel.app",
] + [url for url in frontend_urls if url]

# Log the allowed origins for debugging (safe to log)
print(f"STARTUP: Configuring CORS with allow_origins={allow_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)
app.include_router(action_items.meetings_router)
app.include_router(action_items.actions_router)
app.include_router(search.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "fireflies-clone-api"}
