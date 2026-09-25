import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Meeting, Summary
from app.schemas.schemas import SummaryOut, SummaryUpdate

router = APIRouter(prefix="/api/meetings", tags=["summaries"])


@router.get("/{meeting_id}/summary", response_model=SummaryOut)
def get_summary(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if not meeting.summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return meeting.summary


@router.put("/{meeting_id}/summary", response_model=SummaryOut)
def update_summary(meeting_id: str, payload: SummaryUpdate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    summary = meeting.summary
    if not summary:
        summary = Summary(meeting_id=meeting_id, overview="", key_topics="[]", notes="")
        db.add(summary)

    if payload.overview is not None:
        summary.overview = payload.overview
    if payload.key_topics is not None:
        summary.key_topics = json.dumps(payload.key_topics)
    if payload.notes is not None:
        summary.notes = payload.notes

    from datetime import datetime
    meeting.updated_at = datetime.now().isoformat()

    db.commit()
    db.refresh(summary)
    return summary
