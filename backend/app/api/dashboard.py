# app/api/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.chr_models import User, Event, Donation

# ✅ Use a single router for the whole module
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# 🔹 Dashboard stats
@router.get("/")
def dashboard(db: Session = Depends(get_db), user=Depends(get_current_user)):
    members = db.query(User).count()
    events = db.query(Event).count()
    donations = db.query(Donation).count()

    return {
        "members": members,
        "events": events,
        "donations": donations
    }

# 🔹 User profile
@router.get("/profile")
def get_profile(user=Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}