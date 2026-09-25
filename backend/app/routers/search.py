from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import TranscriptLine, Meeting
from app.schemas.schemas import SearchResult

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search", response_model=list[SearchResult])
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Search transcript lines across all meetings, including titles and participants."""
    like = f"%{q.lower()}%"
    
    # We want to return transcript lines. If the meeting title or participants match,
    # we can just return the first line of that meeting to link to it.
    
    from sqlalchemy import or_
    
    # Find matching meetings
    matching_meetings = db.query(Meeting).filter(
        or_(
            Meeting.title.ilike(like),
            Meeting.participants.ilike(like)
        )
    ).all()
    
    meeting_ids = [m.id for m in matching_meetings]
    
    lines = (
        db.query(TranscriptLine)
        .join(Meeting, Meeting.id == TranscriptLine.meeting_id)
        .filter(
            or_(
                TranscriptLine.text.ilike(like),
                Meeting.id.in_(meeting_ids)
            )
        )
        .limit(50)
        .all()
    )
    
    # To avoid returning EVERY line of a matching meeting, let's group and take first line if it matched via meeting metadata.
    # Actually, a better approach: if meeting matched, return a synthetic SearchResult or just its first line.
    # For simplicity, we just filter text.ilike(like) OR meeting_id in meeting_ids, 
    # but that would return up to 50 lines of the same meeting if it matched by title.
    # Let's write a smarter query:
    
    # 1. Matches from transcript text
    text_matches = (
        db.query(TranscriptLine)
        .join(Meeting, Meeting.id == TranscriptLine.meeting_id)
        .filter(TranscriptLine.text.ilike(like))
        .limit(50)
        .all()
    )
    
    # 2. Matches from meeting title/participants (take first line)
    from sqlalchemy import func
    
    first_lines = []
    if matching_meetings:
        subq = db.query(
            TranscriptLine.meeting_id,
            func.min(TranscriptLine.sequence).label('min_seq')
        ).filter(TranscriptLine.meeting_id.in_(meeting_ids)).group_by(TranscriptLine.meeting_id).subquery()
        
        first_lines = (
            db.query(TranscriptLine)
            .join(subq, (TranscriptLine.meeting_id == subq.c.meeting_id) & (TranscriptLine.sequence == subq.c.min_seq))
            .limit(50)
            .all()
        )
    
    # Combine and deduplicate
    seen_lines = set()
    results = []
    for line in text_matches + first_lines:
        if line.id not in seen_lines:
            seen_lines.add(line.id)
            results.append(
                SearchResult(
                    meeting_id=line.meeting_id,
                    meeting_title=line.meeting.title,
                    line_id=line.id,
                    speaker=line.speaker,
                    text=line.text,
                    start_time=line.start_time,
                    sequence=line.sequence,
                )
            )
            
    # sort results
    results.sort(key=lambda x: (x.meeting_id, x.sequence))
    return results[:50]
