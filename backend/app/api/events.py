# api/events.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chr_models import Event, AdminActionLog
from app.schemas.event import EventCreate, EventOut
from app.core.dependencies import admin_required,get_current_user
import uuid

router = APIRouter(prefix="/events", tags=["Events"])


def log_admin_action(
    db: Session,
    admin_id: str,
    action: str,
    target_id: str = None,
    ip_address: str = None
):
    """Log admin actions for audit trail"""
    log_entry = AdminActionLog(
        admin_id=admin_id,
        action=action,
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()


# ➕ CREATE
@router.post("", response_model=EventOut)
def create_event(
    event: EventCreate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(admin_required),
):
    new_event = Event(
        id=uuid.uuid4(),
        title=event.title,
        description=event.description,
        location=event.location,
        event_date=event.event_date,
        created_by=user.id,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=str(user.id),
        action=f"Created event: {event.title}",
        ip_address=request.client.host if request.client else None
    )

    return new_event


# 📄 GET ALL (public)
@router.get("", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date).all()


# ✏️ UPDATE
@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    updated: EventCreate,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(admin_required),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(404, "Event not found")

    event.title = updated.title
    event.description = updated.description
    event.location = updated.location
    event.event_date = updated.event_date

    db.commit()
    db.refresh(event)

    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=str(user.id),
        action=f"Updated event: {event.title}",
        ip_address=request.client.host if request.client else None
    )

    return event


# ❌ DELETE
@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(admin_required),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(404, "Event not found")

    event_title = event.title  # Store before deletion
    db.delete(event)
    db.commit()

    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=str(user.id),
        action=f"Deleted event: {event_title}",
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Event deleted"}