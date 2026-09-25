from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Meeting, TranscriptLine
from app.schemas.schemas import TranscriptLineCreate, TranscriptLineOut

router = APIRouter(prefix="/api/meetings", tags=["transcripts"])


@router.get("/{meeting_id}/transcript", response_model=list[TranscriptLineOut])
def get_transcript(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting.transcript_lines


@router.post("/{meeting_id}/transcript", response_model=list[TranscriptLineOut], status_code=201)
def replace_transcript(
    meeting_id: str,
    lines: list[TranscriptLineCreate],
    db: Session = Depends(get_db),
):
    """Replace (overwrite) transcript lines for a meeting."""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Delete existing lines
    db.query(TranscriptLine).filter(TranscriptLine.meeting_id == meeting_id).delete()

    new_lines = []
    for i, line_data in enumerate(lines):
        line = TranscriptLine(
            meeting_id=meeting_id,
            speaker=line_data.speaker,
            text=line_data.text,
            start_time=line_data.start_time,
            end_time=line_data.end_time,
            sequence=line_data.sequence if line_data.sequence is not None else i,
        )
        db.add(line)
        new_lines.append(line)

    db.commit()
    for line in new_lines:
        db.refresh(line)
    return new_lines
