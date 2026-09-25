# Fireflies Clone — Meeting Notes & Transcription Platform

A full-stack clone of [Fireflies.ai](https://fireflies.ai) built as an SDE assignment.  
Recreates the Fireflies meeting-assistant experience: meetings library, interactive transcripts, AI summaries, and action items — with an original implementation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand |
| Backend | Python 3.14, FastAPI, SQLAlchemy 2.0 |
| Database | SQLite |
| Icons | Lucide React |
| HTTP | Axios |

---

## Architecture Overview

```
fireflies-clone/
├── frontend/          # Next.js App Router SPA
│   └── src/
│       ├── app/       # Pages (/, /meetings/[id], /settings)
│       ├── components/
│       │   ├── layout/     # Sidebar, Topbar
│       │   ├── meetings/   # Card, Filters, Modals (Create/Edit)
│       │   ├── player/     # MediaPlayer with waveform
│       │   ├── summary/    # Summary tab, Action items tab
│       │   ├── transcript/ # TranscriptPanel + TranscriptLine
│       │   └── ui/         # ToastContainer
│       ├── lib/       # api.ts (Axios client), utils.ts (helpers)
│       ├── store/     # Zustand store (media time, active line, toasts)
│       └── types/     # TypeScript interfaces
└── backend/           # FastAPI REST API
    └── app/
        ├── main.py        # FastAPI app, CORS, router registration
        ├── database.py    # SQLAlchemy engine + session
        ├── models/        # ORM models (Meeting, TranscriptLine, Summary, ActionItem)
        ├── schemas/       # Pydantic request/response schemas
        ├── routers/       # meetings, transcripts, summaries, action_items, search
        └── seed/          # Seed script with 8 realistic meetings
```

**Data flow:**
1. Next.js page fetches data via `lib/api.ts` (Axios) → FastAPI
2. FastAPI validates with Pydantic → queries SQLAlchemy → returns JSON
3. Client state (media time, active transcript line) lives in Zustand
4. `findActiveLineIndex()` uses binary search — no API call on every `timeupdate`

---

## Database Schema

```sql
-- 4 tables with proper foreign keys and cascade deletes

CREATE TABLE meetings (
    id           TEXT PRIMARY KEY,          -- UUID string
    title        TEXT NOT NULL,
    date         TEXT NOT NULL,             -- ISO 8601
    duration     INTEGER NOT NULL,          -- seconds
    participants TEXT NOT NULL,             -- JSON array
    audio_url    TEXT,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

CREATE TABLE transcript_lines (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker    TEXT NOT NULL,
    text       TEXT NOT NULL,
    start_time REAL NOT NULL,              -- seconds from start
    end_time   REAL NOT NULL,
    sequence   INTEGER NOT NULL
);

CREATE TABLE summaries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id TEXT NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
    overview   TEXT NOT NULL,
    key_topics TEXT NOT NULL,              -- JSON array
    notes      TEXT
);

CREATE TABLE action_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    task       TEXT NOT NULL,
    assignee   TEXT,
    due_date   TEXT,
    completed  INTEGER NOT NULL DEFAULT 0
);
```

**Entity relationships:**
- `meetings` 1→N `transcript_lines`
- `meetings` 1→1 `summaries`
- `meetings` 1→N `action_items`
- All children cascade-delete when a meeting is deleted

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings` | List meetings (search, sort, date_from, date_to, participant) |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings/{id}` | Get full meeting (with transcript, summary, actions) |
| PUT | `/api/meetings/{id}` | Update meeting metadata |
| DELETE | `/api/meetings/{id}` | Delete meeting (cascades) |
| GET | `/api/meetings/{id}/transcript` | Get transcript lines |
| POST | `/api/meetings/{id}/transcript` | Replace transcript |
| GET | `/api/meetings/{id}/summary` | Get summary |
| PUT | `/api/meetings/{id}/summary` | Update summary/notes |
| GET | `/api/meetings/{id}/actions` | List action items |
| POST | `/api/meetings/{id}/actions` | Create action item |
| PUT | `/api/actions/{id}` | Update action item (toggle complete, edit) |
| DELETE | `/api/actions/{id}` | Delete action item |
| GET | `/api/search?q=` | Global transcript search |
| GET | `/health` | Health check |

Interactive docs: http://localhost:8000/docs

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd fireflies-clone
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create the data directory
mkdir data

# Seed the database (8 meetings with full content)
python -m app.seed.seed

# Start the API server
python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

> Both servers must be running simultaneously.

---

## Core Features

- **Meetings Dashboard** — grid/list view, search, date filter, sort by date
- **Meeting Detail** — title, date, duration, participants, edit, delete, export
- **Media Player** — simulated playback with waveform, seek bar, play/pause/skip
- **Interactive Transcript** — click line → seek player; player time → highlight active line (binary search, no API calls per frame)
- **Transcript Search** — case-insensitive with match count and highlighted results
- **AI Summary** — seeded overview, key topics, editable notes
- **Action Items** — create, edit, toggle complete, delete; all persisted in SQLite
- **Global Search** — search transcript text across all meetings from the top bar
- **Export** — download meeting as Markdown file
- **Toast notifications** — feedback for all mutations
- **Settings page** — polished placeholder with profile, preferences, notifications, integrations

---

## Assumptions, Limitations & Scope

1. **Original Implementation**: This project is an original implementation built as an assignment. Fireflies.ai is used strictly as a visual and UX reference.
2. **Audio & Synchronization**: The player uses a real HTML5 `<audio>` element with a silent sample audio file (`/sample.wav`) for transcript synchronization. This proves the core concept of syncing native media playback events to interactive UI without requiring large audio files in the repo.
3. **Speech-to-Text**: Real AI transcription (speech-to-text) is out of scope. Transcript data is seeded from mock data or imported via the "Paste/Upload Transcript" feature.
4. **Authentication**: Authentication is mocked/default-user based (Janvi Dev). No real auth flow is implemented.
5. **AI Summaries**: Summaries are seeded/mocked. No actual LLM API calls are made, though the architecture allows plugging a real LLM into the backend service.
6. **Transcript/Player sync**: Uses `findActiveLineIndex()` with binary search — O(log n) on every `timeupdate` event, ensuring perfect sync without backend calls.
7. **Database schema**: `participants` and `key_topics` are stored as JSON strings in SQLite to avoid over-complicating joins for simple lists. `check_same_thread=False` is set for FastAPI's multi-threaded handling.
