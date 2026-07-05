from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chr_models import PrayerRequest, User, AdminActionLog
from app.schemas.prayer import PrayerRequestCreate
from app.core.security import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/prayers", tags=["Prayers"])


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

# =========================
# CREATE PRAYER (USER)
# =========================
@router.post("/")
def create_prayer(
    payload: PrayerRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prayer = PrayerRequest(
        user_id=current_user.id,
        name=payload.name,
        request=payload.request,
        is_approved=False
    )

    db.add(prayer)
    db.commit()
    db.refresh(prayer)
    return prayer

# ✅ Prayer Count API
@router.get("/count")
def get_prayer_count(db: Session = Depends(get_db)):
    count = db.query(PrayerRequest).filter(
        PrayerRequest.is_approved == True
    ).count()

    return {"count": count}

# =========================
# GET APPROVED PRAYERS (PUBLIC)
# =========================
@router.get("/")
def get_prayers(db: Session = Depends(get_db)):
    return db.query(PrayerRequest)\
        .filter(PrayerRequest.is_approved == True)\
        .order_by(PrayerRequest.created_at.desc()).all()


# =========================
# ADMIN GET ALL
# =========================
@router.get("/admin")
def get_all_prayers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "PASTOR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(PrayerRequest)\
        .order_by(PrayerRequest.created_at.desc()).all()


# =========================
# APPROVE PRAYER (ADMIN ONLY)
# =========================
@router.put("/{id}/approve")
def approve_prayer(
    id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["ADMIN", "PASTOR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    prayer = db.query(PrayerRequest).get(id)

    if not prayer:
        raise HTTPException(404, "Not found")

    prayer.is_approved = True
    db.commit()

    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=str(current_user.id),
        action=f"Approved prayer request from: {prayer.name}",
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Approved"}


# =========================
# UPDATE PRAYER (USER OWN OR ADMIN)
# =========================
@router.put("/{id}")
def update_prayer(
    id: uuid.UUID,
    payload: PrayerRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prayer = db.query(PrayerRequest).get(id)

    if not prayer:
        raise HTTPException(404, "Not found")

    # admin can edit all
    if current_user.role not in ["ADMIN", "PASTOR"]:
        if prayer.user_id != current_user.id:
            raise HTTPException(403, "Not allowed")

    prayer.name = payload.name
    prayer.request = payload.request

    db.commit()
    db.refresh(prayer)
    return prayer


# =========================
# DELETE PRAYER (USER OWN OR ADMIN)
# =========================
@router.delete("/{id}")
def delete_prayer(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prayer = db.query(PrayerRequest).get(id)

    if not prayer:
        raise HTTPException(404, "Not found")

    # admin can delete all
    if current_user.role not in ["ADMIN", "PASTOR"]:
        if prayer.user_id != current_user.id:
            raise HTTPException(403, "Not allowed")

    db.delete(prayer)
    db.commit()

    return {"message": "Deleted"}