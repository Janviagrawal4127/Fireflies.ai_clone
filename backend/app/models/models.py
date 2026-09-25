import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    from datetime import timezone
    return datetime.now(timezone.utc).isoformat()


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)          # ISO 8601 string
    duration = Column(Integer, nullable=False)     # total seconds
    participants = Column(Text, nullable=False, default="[]")  # JSON array
    audio_url = Column(String, nullable=True)
    created_at = Column(String, nullable=False, default=now_iso)
    updated_at = Column(String, nullable=False, default=now_iso, onupdate=now_iso)

    # Relationships
    transcript_lines = relationship(
        "TranscriptLine", back_populates="meeting", cascade="all, delete-orphan",
        order_by="TranscriptLine.sequence"
    )
    summary = relationship(
        "Summary", back_populates="meeting", cascade="all, delete-orphan",
        uselist=False
    )
    action_items = relationship(
        "ActionItem", back_populates="meeting", cascade="all, delete-orphan"
    )

    @property
    def participants_list(self):
        return json.loads(self.participants)

    @property
    def key_topics_list(self):
        return json.loads(self.summary.key_topics) if self.summary and self.summary.key_topics else []


class TranscriptLine(Base):
    __tablename__ = "transcript_lines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    speaker = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    start_time = Column(Float, nullable=False)   # seconds from start
    end_time = Column(Float, nullable=False)
    sequence = Column(Integer, nullable=False)    # ordering within meeting

    meeting = relationship("Meeting", back_populates="transcript_lines")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    overview = Column(Text, nullable=False)
    key_topics = Column(Text, nullable=False, default="[]")  # JSON array of strings
    notes = Column(Text, nullable=True, default="")

    meeting = relationship("Meeting", back_populates="summary")

    @property
    def key_topics_list(self):
        return json.loads(self.key_topics)


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    task = Column(Text, nullable=False)
    assignee = Column(String, nullable=True)
    due_date = Column(String, nullable=True)      # ISO date string
    completed = Column(Boolean, nullable=False, default=False)

    meeting = relationship("Meeting", back_populates="action_items")
