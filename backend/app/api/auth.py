# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from fastapi import Request  # import Request to get client IP
from datetime import datetime
from app.schemas.auth import (
    SendOTP, VerifyOTP, Token, LoginRequest,
    ForgotPasswordRequest, ResetPasswordRequest, UpdateProfileSchema
)
from app.core.database import get_db
from app.models.chr_models import User, OTP, RoleEnum, PasswordResetToken
from app.core.security import hash_password, verify_password, create_access_token
from app.services.email_service import send_email, send_reset_email
from app.services.otp_service import create_otp, verify_otp
from app.services.email_service import send_welcome_email
from app.core.security import get_current_user, admin_required

router = APIRouter(prefix="/auth", tags=["Auth"])

# -------------------------------
# 🔹 Signup
# -------------------------------
@router.post("/signup", response_model=Token)
def signup(user: LoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)

    new_user = User(
        email=user.email,
        hashed_password=hashed,
        role=RoleEnum.MEMBER,
        is_active=True,
        is_approved=False,
        token_version=0
    )

    db.add(new_user)
    db.commit()
    # db.refresh(new_user)

    background_tasks.add_task(send_welcome_email, new_user.email, new_user.email)

    access_token = create_access_token({
        "user_id": str(new_user.id),
        "role": new_user.role.value,
        "token_version": new_user.token_version
    })

    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------------
# 🔹 Password login
# -------------------------------


@router.post("/login", response_model=Token)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_approved:
        raise HTTPException(status_code=403, detail="User not approved")

    user.last_login = datetime.utcnow()
    user.last_login_ip = request.client.host
    db.commit()

    access_token = create_access_token({
        "user_id": str(user.id),
        "role": user.role.value,
        "token_version": user.token_version
    })

    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------------
# 🔹 OTP login
# -------------------------------
@router.post("/send-otp", response_model=dict)
def send_otp_route(data: SendOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = create_otp(db, data.email)
    send_email(data.email, otp_code)
    print(f"OTP for {data.email}: {otp_code}")

    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=Token)
def verify_otp_route(data: VerifyOTP, db: Session = Depends(get_db)):

    if not verify_otp(db, data.email, data.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == data.email).first()

    if not user.is_approved:
        raise HTTPException(status_code=403, detail="User not approved")

    access_token = create_access_token({
        "user_id": str(user.id),
        "role": user.role.value,
        "token_version": user.token_version
    })

    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------------
# 🔹 Forgot password
# -------------------------------
@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = str(uuid.uuid4())
    reset_token = PasswordResetToken(
        email=user.email,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=15)
    )
    db.add(reset_token)
    db.commit()

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    send_reset_email(user.email, reset_link)

    return {"message": "Password reset email sent"}

# -------------------------------
# 🔹 Reset password
# -------------------------------
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Find the token
    token_entry = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == data.token
    ).first()
    if not token_entry:
        raise HTTPException(status_code=400, detail="Invalid token")
    if token_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")

    # Reset user password
    user = db.query(User).filter(User.email == token_entry.email).first()
    user.hashed_password = hash_password(data.password)  # <- use 'password'

    # Delete token
    db.delete(token_entry)
    db.commit()

    return {"message": "Password reset successful"}


# -------------------------------
# 🔹 Get Current User
# -------------------------------
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.email.split("@")[0],
        "email": current_user.email,
        "phone": current_user.phone if hasattr(current_user, "phone") else "",
        "role": current_user.role.value
    }


@router.put("/update-profile")
def update_profile(
    data: UpdateProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.phone:
        user.phone = data.phone

    password_changed = False

    if data.password:
        user.hashed_password = hash_password(data.password)

        # 🔥 LOGOUT ALL DEVICES
        user.token_version += 1
        password_changed = True

    db.commit()

    return {
        "message": "Profile updated successfully",
        "force_logout": password_changed
    }