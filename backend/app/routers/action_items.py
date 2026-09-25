from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Meeting, ActionItem
from app.schemas.schemas import ActionItemCreate, ActionItemUpdate, ActionItemOut

meetings_router = APIRouter(prefix="/api/meetings", tags=["action_items"])
actions_router = APIRouter(prefix="/api/actions", tags=["action_items"])


@meetings_router.get("/{meeting_id}/actions", response_model=list[ActionItemOut])
def get_actions(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting.action_items


@meetings_router.post("/{meeting_id}/actions", response_model=ActionItemOut, status_code=201)
def create_action(meeting_id: str, payload: ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    item = ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@actions_router.put("/{item_id}", response_model=ActionItemOut)
def update_action(item_id: int, payload: ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@actions_router.delete("/{item_id}", status_code=204)
def delete_action(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    db.delete(item)
    db.commit()
