import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Meeting, Summary, TranscriptLine, ActionItem
from app.schemas.schemas import (
    MeetingCreate, MeetingUpdate, MeetingOut, MeetingListItem
)

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _build_preview(meeting: Meeting) -> Optional[str]:
    if meeting.summary and meeting.summary.overview:
        return meeting.summary.overview[:120]
    return None


@router.get("", response_model=list[MeetingListItem])
def list_meetings(
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("recent"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    participant: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    from sqlalchemy.orm import joinedload
    q = db.query(Meeting).options(joinedload(Meeting.summary))

    if search:
        like = f"%{search.lower()}%"
        q = q.filter(Meeting.title.ilike(like) | Meeting.participants.ilike(like))

    if date_from:
        q = q.filter(Meeting.date >= date_from)
    if date_to:
        end_date = date_to if "T" in date_to else date_to + "T23:59:59"
        q = q.filter(Meeting.date <= end_date)

    if participant:
        q = q.filter(Meeting.participants.ilike(f"%{participant}%"))

    if sort == "oldest":
        q = q.order_by(Meeting.date.asc())
    else:
        q = q.order_by(Meeting.date.desc())

    meetings = q.all()

    result = []
    for m in meetings:
        item = MeetingListItem.model_validate(m)
        item.summary_preview = _build_preview(m)
        result.append(item)
    return result


@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    out = MeetingOut.model_validate(meeting)
    out.summary_preview = _build_preview(meeting)
    return out


@router.post("", response_model=MeetingOut, status_code=201)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)):
    meeting = Meeting(
        title=payload.title,
        date=payload.date,
        duration=payload.duration,
        participants=json.dumps(payload.participants),
        audio_url=payload.audio_url,
    )
    db.add(meeting)
    db.flush()  # get meeting.id before adding children

    # Inline transcript
    if payload.transcript:
        for line_data in payload.transcript:
            line = TranscriptLine(meeting_id=meeting.id, **line_data.model_dump())
            db.add(line)

    # Inline summary
    if payload.summary:
        summary = Summary(
            meeting_id=meeting.id,
            overview=payload.summary.overview,
            key_topics=json.dumps(payload.summary.key_topics),
            notes=payload.summary.notes or "",
        )
        db.add(summary)
    else:
        # Create an empty summary placeholder
        db.add(Summary(meeting_id=meeting.id, overview="", key_topics="[]", notes=""))

    # Inline action items
    if payload.action_items:
        for ai_data in payload.action_items:
            ai = ActionItem(meeting_id=meeting.id, **ai_data.model_dump())
            db.add(ai)

    db.commit()
    db.refresh(meeting)
    out = MeetingOut.model_validate(meeting)
    out.summary_preview = _build_preview(meeting)
    return out


@router.put("/{meeting_id}", response_model=MeetingOut)
def update_meeting(meeting_id: str, payload: MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "participants" in update_data:
        update_data["participants"] = json.dumps(update_data["participants"])

    for field, value in update_data.items():
        setattr(meeting, field, value)

    from datetime import datetime
    meeting.updated_at = datetime.utcnow().isoformat()

    db.commit()
    db.refresh(meeting)
    out = MeetingOut.model_validate(meeting)
    out.summary_preview = _build_preview(meeting)
    return out


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
