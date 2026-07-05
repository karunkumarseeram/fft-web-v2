# app/services/otp_service.py
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.chr_models import OTP

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def create_otp(db: Session, email: str) -> str:
    otp_code = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=5)

    otp_entry = OTP(email=email, otp=otp_code, expires_at=expires, is_used=False)
    db.add(otp_entry)
    db.commit()
    db.refresh(otp_entry)

    return otp_code

def verify_otp(db: Session, email: str, otp: str) -> bool:
    otp_entry = (
        db.query(OTP)
        .filter(OTP.email == email, OTP.otp == otp, OTP.is_used == False)
        .first()
    )

    if not otp_entry or otp_entry.expires_at < datetime.utcnow():
        return False

    otp_entry.is_used = True
    db.commit()
    return True