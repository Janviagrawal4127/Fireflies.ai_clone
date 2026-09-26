# Fireflies.ai Clone — Meeting Notes & Transcription Platform

A full-stack meeting assistant inspired by Fireflies.ai that provides a meeting library, interactive transcripts, audio playback, AI-style summaries, action items, search, analytics, notebook, integrations, and workspace management.

## 🚀 Live Demo

### Frontend
[https://fireflies-ai-clone-u4h4.vercel.app/](https://fireflies-ai-clone-u4h4.vercel.app/)

### Backend API
[https://fireflies-ai-clone-admk.onrender.com/](https://fireflies-ai-clone-admk.onrender.com/)

* Frontend deployed on Vercel.
* Backend deployed on Render.
* Default demo workspace does not require authentication.

## ✨ Application Preview

- **Landing Page**
- **Dashboard**
- **Meeting Detail / Transcript**
- **Notebook**
- **Analytics**
- **Integrations**
- **Settings**
- **Library**

*(UI screenshots can be added here once generated)*

## 📋 Features

### Meeting Workspace
- Meeting library
- Grid/List view
- Search
- Date filtering
- Participant filtering
- Recent/Oldest sorting
- Meeting creation
- Meeting editing
- Meeting deletion

### Interactive Transcript
- Speaker labels
- Timestamps
- Transcript search
- Search highlighting
- Click transcript line → seek audio
- Audio playback → active transcript synchronization
- Binary-search transcript synchronization

### AI Summary
- Meeting overview
- Key topics
- Editable notes
- Action items
- Action item completion
- Action item CRUD

### Library
- Starred meetings
- Recent meetings
- Recent Notebook notes
- Shared with me
- Persistent local workspace state

### Workspace
- Notebook
- Analytics
- Integrations
- Settings
- Profile
- Responsive sidebar/navigation

### Landing Experience
- Fireflies-inspired landing page
- Product feature sections
- CTA
- Direct navigation to dashboard

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, React |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| API Communication | REST |
| Deployment | Vercel + Render |
| Audio | HTML5 Audio API |
| Persistence | SQLite + localStorage |

## 🏗️ Architecture

**Frontend:**
```
Next.js App Router
    ↓
Reusable React Components
    ↓
Zustand / API utilities
    ↓
FastAPI REST API
```

**Backend:**
```
FastAPI
    ↓
Routers
    ↓
SQLAlchemy ORM
    ↓
SQLite
```

Browser-only workspace features such as local starred/recent/shared state use `localStorage` because authentication and multi-user collaboration are intentionally outside the assignment scope.

## 📁 Project Structure

```
Fireflies.ai_clone/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── meetings/
│   │   │   ├── notebook/
│   │   │   ├── integrations/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   ├── starred/
│   │   │   ├── recent/
│   │   │   ├── shared/
│   │   │   └── page.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   ├── store/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── seed/
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
```

## 🗄️ Database Design

The backend uses a relational SQLite database with the following primary tables:

*   **`meetings`**: Stores meeting metadata (title, date, duration, participants as JSON, audio URL).
*   **`transcript_lines`**: Stores individual transcript utterances linked to a meeting via a foreign key. Includes start/end timestamps, speaker name, text, and sequence order.
*   **`summaries`**: Stores AI-style meeting overviews, key topics (as JSON), and editable user notes. Linked 1-to-1 with a meeting.
*   **`action_items`**: Stores tasks generated from the meeting, including assignee, due date, and completion status. Linked many-to-1 with a meeting.

**Entity Relationship Overview:**
```
Meeting
 ├── TranscriptLine (1-to-many)
 ├── Summary (1-to-1)
 └── ActionItem (1-to-many)
```
Participants and key topics are stored as JSON arrays to simplify the schema for a prototype scope while retaining flexibility.

## 🔌 API Overview

Key REST endpoints provided by the FastAPI backend:

**Meetings**
*   `GET    /api/meetings`
*   `GET    /api/meetings/{id}`
*   `POST   /api/meetings`
*   `PUT    /api/meetings/{id}`
*   `DELETE /api/meetings/{id}`

**Transcripts**
*   `GET    /api/meetings/{id}/transcript`
*   `POST   /api/meetings/{id}/transcript`

**Summaries**
*   `GET    /api/meetings/{id}/summary`
*   `PUT    /api/meetings/{id}/summary`

**Action Items**
*   `GET    /api/meetings/{id}/actions`
*   `POST   /api/meetings/{id}/actions`
*   `PUT    /api/actions/{item_id}`
*   `DELETE /api/actions/{item_id}`

**Search**
*   `GET    /api/search`

## 💻 Local Development

### Backend

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# Seed the database with demo data:
python -m app.seed.seed

# Run the API:
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then run the development server:
```bash
npm run dev
```

*   **Frontend:** http://localhost:3000
*   **Backend:** http://localhost:8000
*   **Health:** http://localhost:8000/health

## ☁️ Deployment

### Frontend — Vercel

*   **Live:** https://fireflies-ai-clone-u4h4.vercel.app/
*   **Root Directory:** `frontend`
*   **Environment Variable:**
    ```
    NEXT_PUBLIC_API_URL=https://fireflies-ai-clone-admk.onrender.com
    ```

### Backend — Render

*   **Live:** https://fireflies-ai-clone-admk.onrender.com/
*   **Root Directory:** `backend`
*   **Build Command:** `pip install -r requirements.txt`
*   **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
*   **Environment Variable:**
    ```
    FRONTEND_URL=https://fireflies-ai-clone-u4h4.vercel.app/
    ```

## ⚠️ Important Deployment Note

The current prototype uses **SQLite**. Render's default free-tier filesystem is ephemeral, meaning any persistent user-created SQLite data may reset on instance restart unless a persistent disk is configured. The seeded demo data can easily be recreated on startup. SQLite is used here for rapid prototyping and assignment purposes rather than production-grade multi-user storage.

## 🧪 Quality Checks

- TypeScript compilation
- Production build
- Backend API testing
- CRUD testing
- Transcript/audio synchronization
- Global search
- Responsive UI testing
- Error handling
- Toast notifications
- XSS-safe transcript highlighting
- SQLite foreign-key enforcement
- N+1 query optimization

## 🚧 Scope / Limitations

The following features were intentionally considered outside the scope of this assignment:

- Real authentication & OAuth
- Real-time meeting bot recording
- Live speech-to-text processing
- Real Zoom/Google Meet integrations
- Multi-user collaboration & permissions
- Production billing
- Real cloud-scale database (e.g. PostgreSQL)

Mocked and seeded data is utilized intentionally to fulfill the assignment requirements.

## 👩‍💻 Author

**Janvi Agrawal**
B.Tech Computer Science — Data Science
UPES Dehradun
GitHub: [https://github.com/Janviagrawal4127](https://github.com/Janviagrawal4127)
