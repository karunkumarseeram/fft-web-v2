from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import feedback_service
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackReply,
    FeedbackStatusUpdate,
)

from app.core.dependencies import get_current_user  # adjust if your path differs
from app.models.chr_models import User  # adjust if your path differs


router = APIRouter(prefix="/feedback", tags=["Feedback"])


# ================= CREATE FEEDBACK =================
@router.post("")
def create_feedback(
    payload: FeedbackCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # can be optional if anonymous allowed
):
    ip_address = request.client.host

    feedback = feedback_service.create_feedback(
        db=db,
        payload=payload,
        user_id=current_user.id if current_user else None,
        ip_address=ip_address,
    )

    return {
        "message": "Feedback submitted successfully",
        "data": feedback,
    }


# ================= GET MY FEEDBACK =================
@router.get("/my")
def get_my_feedbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedbacks = feedback_service.get_user_feedbacks(db, current_user.id)

    return {
        "message": "User feedback fetched",
        "data": feedbacks,
    }


# ================= GET SINGLE =================
@router.get("/{feedback_id}")
def get_feedback(feedback_id: str, db: Session = Depends(get_db)):
    feedback = feedback_service.get_feedback(db, feedback_id)

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "message": "Feedback fetched",
        "data": feedback,
    }


# ================= ADMIN: LIST ALL =================
@router.get("/admin/all")
def get_all_feedbacks(
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        return {"detail": "Not authorized"}

    result = feedback_service.get_all_feedbacks(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
    )

    return result

# ================= ADMIN: REPLY =================
@router.post("/admin/{feedback_id}/reply")
def reply_feedback(
    feedback_id: str,
    payload: FeedbackReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedback = feedback_service.reply_feedback(db, feedback_id, payload)

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "message": "Reply added successfully",
        "data": feedback,
    }


# ================= ADMIN: UPDATE STATUS =================
@router.patch("/admin/{feedback_id}/status")
def update_status(
    feedback_id: str,
    payload: FeedbackStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedback = feedback_service.update_feedback_status(db, feedback_id, payload)

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "message": "Status updated",
        "data": feedback,
    }


# ================= DELETE (SOFT DELETE) =================
@router.delete("/admin/{feedback_id}")
def delete_feedback(
    feedback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = feedback_service.delete_feedback(db, feedback_id)

    if not success:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return {
        "message": "Feedback deleted successfully",
    }