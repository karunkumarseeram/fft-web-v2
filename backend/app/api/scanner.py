# api/scanner.py
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user, admin_required
from app.core.config import settings
from app.models.chr_models import User, Event, EventAttendance
import uuid
import base64
import io
from PIL import Image
import qrcode
import json
from datetime import datetime
import cv2
import numpy as np

router = APIRouter(prefix="/scanner", tags=["Scanner"])


# Get bank payment details for frontend
@router.get("/info/bank-details")
async def get_bank_details():
    """Get bank payment details for manual donations (public endpoint)"""
    return BankDetails(
        bank_name=settings.BANK_NAME,
        account_number=settings.ACCOUNT_NUMBER,
        ifsc=settings.IFSC,
        upi=settings.UPI
    )


class GenerateQRCodeRequest(BaseModel):
    type: str
    id: str


class BankDetails(BaseModel):
    bank_name: Optional[str]
    account_number: Optional[str]
    ifsc: Optional[str]
    upi: Optional[str]


# Generate QR Code for events or members
@router.post("/generate-qr")
async def generate_qr_code(
    payload: GenerateQRCodeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Generate QR code for events or members"""
    try:
        qr_type = payload.type
        qr_id = payload.id

        if qr_type == "event":
            event = db.query(Event).filter(Event.id == qr_id).first()

            if not event:
                raise HTTPException(status_code=404, detail="Event not found")

            qr_data = {
                "type": "event_checkin",
                "event_id": str(event.id),
                "event_title": event.title,
                "timestamp": datetime.utcnow().isoformat()
            }

        elif qr_type == "member":
            member = db.query(User).filter(User.id == qr_id).first()
            if not member:
                raise HTTPException(status_code=404, detail="Member not found")

            qr_data = {
                "type": "member_verification",
                "member_id": str(member.id),
                "member_name": member.name,
                "member_phone": member.phone,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid type. Use 'event' or 'member'")

        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )

        qr_data_str = json.dumps(qr_data)
        qr.add_data(qr_data_str)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "qr_code": img_base64,
            "data": qr_data_str,
            "type": qr_type,
            "id": qr_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating QR code: {str(e)}")


# Scan QR Code for check-in
@router.post("/scan")
async def scan_qr_code(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Scan QR code for event check-in"""
    try:
        data = await request.json()
        image_base64 = data.get("image")
        event_id = data.get("event_id")

        if not image_base64 or not event_id:
            raise HTTPException(status_code=400, detail="Image and event_id are required")

        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))

        # Convert PIL image to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Decode QR codes using OpenCV
        detector = cv2.QRCodeDetector()
        data, bbox, straight_qrcode = detector.detectAndDecode(opencv_image)

        if not data:
            raise HTTPException(status_code=400, detail="No QR code found in image. Please ensure the QR code is clearly visible and try again.")

        # Parse the QR data (assuming it's JSON)
        try:
            qr_data = json.loads(data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid QR code format. The QR code does not contain valid data.")

        # Check if event exists
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Process based on QR code type
        if qr_data.get("type") == "event_checkin":
            # Event check-in QR code
            qr_event_id = qr_data.get("event_id")
            if qr_event_id != event_id:
                raise HTTPException(status_code=400, detail="QR code is for a different event")

            # For event check-in, we need member information
            # This would typically be a generic event QR that members scan
            # For now, we'll use the current user as the member
            member_id = current_user.get("id")

        elif qr_data.get("type") == "member_verification":
            # Member-specific QR code
            member_id = qr_data.get("member_id")

        else:
            raise HTTPException(status_code=400, detail="Invalid QR code type")

        # Get member details
        member = db.query(User).filter(User.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        # Check if already checked in
        existing_attendance = db.query(EventAttendance).filter(
            EventAttendance.event_id == event_id,
            EventAttendance.member_id == member_id
        ).first()

        if existing_attendance:
            return {
                "success": False,
                "message": "Already checked in to this event",
                "member": {
                    "id": str(member.id),
                    "name": member.name,
                    "phone": member.phone
                }
            }

        # Create attendance record
        attendance = EventAttendance(
            event_id=event_id,
            member_id=member_id,
            checked_in_by=current_user.get("id"),
            check_in_time=datetime.utcnow()
        )

        db.add(attendance)
        db.commit()

        return {
            "success": True,
            "message": f"Successfully checked in {member.name} to {event.title}",
            "member": {
                "id": str(member.id),
                "name": member.name,
                "phone": member.phone
            },
            "event": {
                "id": str(event.id),
                "title": event.title
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing scan: {str(e)}")


# Get event attendance
@router.get("/events/{event_id}/attendance")
async def get_event_attendance(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get attendance list for an event"""
    try:
        # Check if user has permission (admin or event creator)
        if current_user.get("role") not in ["ADMIN", "PASTOR"]:
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event or str(event.created_by) != current_user.get("id"):
                raise HTTPException(status_code=403, detail="Not authorized to view attendance")

        attendance_records = db.query(EventAttendance).filter(
            EventAttendance.event_id == event_id
        ).all()

        attendance_list = []
        for record in attendance_records:
            member = db.query(User).filter(User.id == record.member_id).first()
            if member:
                attendance_list.append({
                    "id": str(record.id),
                    "member_id": str(member.id),
                    "name": member.name,
                    "phone": member.phone,
                    "check_in_time": record.check_in_time.isoformat(),
                    "checked_in_by": str(record.checked_in_by) if record.checked_in_by else None
                })

        return attendance_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attendance: {str(e)}")


# Manual check-in (for admins)
@router.post("/events/{event_id}/checkin/{member_id}")
async def manual_checkin(
    event_id: str,
    member_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Manually check in a member to an event"""
    try:
        # Check if event exists
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Check if member exists
        member = db.query(User).filter(User.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")

        # Check if already checked in
        existing_attendance = db.query(EventAttendance).filter(
            EventAttendance.event_id == event_id,
            EventAttendance.member_id == member_id
        ).first()

        if existing_attendance:
            raise HTTPException(status_code=400, detail="Member already checked in")

        # Create attendance record
        attendance = EventAttendance(
            event_id=event_id,
            member_id=member_id,
            checked_in_by=current_user.id,
            check_in_time=datetime.utcnow()
        )

        db.add(attendance)
        db.commit()

        return {
            "success": True,
            "message": f"Successfully checked in {member.name} to {event.title}",
            "attendance_id": str(attendance.id)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during check-in: {str(e)}")


# Get attendance statistics
@router.get("/events/{event_id}/stats")
async def get_attendance_stats(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get attendance statistics for an event"""
    try:
        # Check permissions
        if current_user.get("role") not in ["ADMIN", "PASTOR"]:
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event or str(event.created_by) != current_user.get("id"):
                raise HTTPException(status_code=403, detail="Not authorized")

        total_attendance = db.query(EventAttendance).filter(
            EventAttendance.event_id == event_id
        ).count()

        # Get event details
        event = db.query(Event).filter(Event.id == event_id).first()

        return {
            "event_id": event_id,
            "event_title": event.title if event else "Unknown Event",
            "total_attendance": total_attendance,
            "event_date": event.event_date.isoformat() if event else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")