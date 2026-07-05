import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, admin_required
from app.models.chr_models import Donation, AdminActionLog
from app.schemas.donation import DonationCreate, DonationOut

router = APIRouter(prefix="/donations", tags=["Donations", "Payments"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


# ================================
# STRIPE SESSION (FIXED SAFE)
# ================================
@router.post("/create-stripe-session")
async def create_stripe_session(request: Request):
    data = await request.json()

    try:
        donor_name = data.get("donor_name", "Anonymous")

        # 🔥 FIX: validation guard
        if "amount" not in data:
            raise HTTPException(status_code=400, detail="Amount is required")

        amount = float(data["amount"])

        if amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "inr",
                    "unit_amount": int(amount * 100),
                    "product_data": {
                        "name": "Church Donation",
                        "description": f"Donor: {donor_name}",
                    },
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=data["success_url"],
            cancel_url=data["cancel_url"],
            metadata={"donor_name": donor_name},
        )

        return {"id": session.id, "url": session.url}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


# ================================
# STRIPE WEBHOOK
# ================================
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=webhook_secret
        )

    except Exception:
        raise HTTPException(status_code=400, detail="Webhook error")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        donor_name = session.get("metadata", {}).get("donor_name", "Anonymous")
        amount = session.get("amount_total", 0) / 100

        existing = db.query(Donation).filter(
            Donation.transaction_id == session.get("id")
        ).first()

        if not existing:
            donation = Donation(
                donor_name=donor_name,
                amount=amount,
                payment_method="STRIPE",
                transaction_id=session.get("id"),
                status="SUCCESS",
                donated_at=datetime.utcnow()
            )

            db.add(donation)
            db.commit()

    return {"success": True}


# ================================
# BANK INFO (UNCHANGED)
# ================================
@router.get("/info/bank-details")
def get_bank_and_upi_details():
    return {
        "bank_name": os.getenv("BANK_NAME") or "",
        "account_number": os.getenv("BANK_ACCOUNT") or "",
        "ifsc": os.getenv("BANK_IFSC") or "",
        "upi": os.getenv("UPI_ID") or "",
        "payee_name": os.getenv("PAYEE_NAME") or "",
        "payee_phone": os.getenv("PAYEE_PHONE") or "",
    }


# ================================
# CREATE MANUAL DONATION
# ================================
@router.post("/", response_model=DonationOut)
async def create_donation(
    donation: DonationCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_donation = Donation(
        user_id=getattr(current_user, "id", None),
        donor_name=donation.donor_name,
        amount=donation.amount,
        payment_method=donation.payment_method,
        transaction_id=donation.transaction_id,
        status="PENDING",
        ip_address=request.client.host if request.client else None,
        donated_at=datetime.utcnow()
    )

    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)
    return new_donation


# ================================
# ADMIN VIEW (UNCHANGED)
# ================================
@router.get("/", response_model=List[DonationOut])
async def get_all(db: Session = Depends(get_db), current_user=Depends(admin_required)):
    return db.query(Donation).all()


# ================================
# USER VIEW (OLD - KEEP)
# ================================
@router.get("/my-donations", response_model=List[DonationOut])
async def my_donations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Donation).filter(Donation.user_id == current_user.id).all()


# ================================
# 🔥 NEW FIXED ROUTE (MISSING ONE)
# ================================
@router.get("/my", response_model=List[DonationOut])
async def my_donations_alias(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Donation).filter(Donation.user_id == current_user.id).all()


# ================================
# STATS (UNCHANGED)
# ================================
@router.get("/stats/summary")
async def donation_stats(
    db: Session = Depends(get_db),
    current_user=Depends(admin_required)
):
    total_donations = db.query(func.count(Donation.id)).scalar()

    total_amount = db.query(func.sum(Donation.amount)).filter(
        Donation.status == "SUCCESS"
    ).scalar() or 0

    current_year = datetime.now().year
    monthly_stats = {}

    for month in range(1, 13):
        start = datetime(current_year, month, 1)
        end = datetime(current_year + 1, 1, 1) if month == 12 else datetime(current_year, month + 1, 1)

        amount = db.query(func.sum(Donation.amount)).filter(
            Donation.status == "SUCCESS",
            Donation.donated_at >= start,
            Donation.donated_at < end
        ).scalar() or 0

        monthly_stats[month] = amount

    return {
        "total_donations": total_donations,
        "total_amount": total_amount,
        "monthly_stats": monthly_stats,
        "currency": "INR"
    }


# ================================
# TOP DONORS (UNCHANGED)
# ================================
@router.get("/stats/top-donors")
async def top_donors(
    db: Session = Depends(get_db),
    current_user=Depends(admin_required)
):
    result = db.query(
        Donation.donor_name,
        func.sum(Donation.amount).label("total")
    ).filter(
        Donation.status == "SUCCESS"
    ).group_by(
        Donation.donor_name
    ).order_by(
        func.sum(Donation.amount).desc()
    ).limit(10).all()

    return [
        {"donor_name": r[0], "total": r[1]}
        for r in result
    ]