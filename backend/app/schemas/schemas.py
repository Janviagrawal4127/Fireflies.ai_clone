from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, field_validator
import json


# ─── Transcript ──────────────────────────────────────────────────────────────

class TranscriptLineBase(BaseModel):
    speaker: str
    text: str
    start_time: float
    end_time: float
    sequence: int


class TranscriptLineCreate(TranscriptLineBase):
    pass


class TranscriptLineOut(TranscriptLineBase):
    id: int
    meeting_id: str

    model_config = {"from_attributes": True}


# ─── Summary ─────────────────────────────────────────────────────────────────

class SummaryBase(BaseModel):
    overview: str
    key_topics: List[str] = []
    notes: Optional[str] = ""


class SummaryCreate(SummaryBase):
    pass


class SummaryUpdate(BaseModel):
    overview: Optional[str] = None
    key_topics: Optional[List[str]] = None
    notes: Optional[str] = None


class SummaryOut(BaseModel):
    id: int
    meeting_id: str
    overview: str
    key_topics: List[str]
    notes: Optional[str]

    model_config = {"from_attributes": True}

    @field_validator("key_topics", mode="before")
    @classmethod
    def parse_key_topics(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


# ─── Action Items ─────────────────────────────────────────────────────────────

class ActionItemBase(BaseModel):
    task: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    completed: bool = False


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    task: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None


class ActionItemOut(ActionItemBase):
    id: int
    meeting_id: str

    model_config = {"from_attributes": True}


# ─── Meetings ─────────────────────────────────────────────────────────────────

class MeetingBase(BaseModel):
    title: str
    date: str
    duration: int                          # seconds
    participants: List[str] = []
    audio_url: Optional[str] = None


class MeetingCreate(MeetingBase):
    # Allow inline transcript + summary creation
    transcript: Optional[List[TranscriptLineCreate]] = None
    summary: Optional[SummaryCreate] = None
    action_items: Optional[List[ActionItemCreate]] = None
    raw_transcript: Optional[str] = None  # pasted plain text


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    duration: Optional[int] = None
    participants: Optional[List[str]] = None
    audio_url: Optional[str] = None


class MeetingOut(BaseModel):
    id: str
    title: str
    date: str
    duration: int
    participants: List[str]
    audio_url: Optional[str]
    created_at: str
    updated_at: str
    summary_preview: Optional[str] = None  # first 120 chars of overview
    summary: Optional[SummaryOut] = None
    transcript_lines: List[TranscriptLineOut] = []
    action_items: List[ActionItemOut] = []

    model_config = {"from_attributes": True}

    @field_validator("participants", mode="before")
    @classmethod
    def parse_participants(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


class MeetingListItem(BaseModel):
    """Lightweight version for the list endpoint — no transcript lines."""
    id: str
    title: str
    date: str
    duration: int
    participants: List[str]
    audio_url: Optional[str]
    created_at: str
    updated_at: str
    summary_preview: Optional[str] = None

    model_config = {"from_attributes": True}

    @field_validator("participants", mode="before")
    @classmethod
    def parse_participants(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


# ─── Search ───────────────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    meeting_id: str
    meeting_title: str
    line_id: int
    speaker: str
    text: str
    start_time: float
    sequence: int
