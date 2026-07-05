from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.core.security import get_current_user, admin_required
from app.core.database import get_db
from app.models.chr_models import BibleVerse, AdminActionLog
from app.bible_data import DAILY_VERSES, get_books, get_chapters, get_daily_verse

router = APIRouter(prefix="/bible", tags=["Bible"])


def log_admin_action(
    db: Session,
    admin_id: str,
    action: str,
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


# Pydantic models for request/response
class BibleVerseCreate(BaseModel):
    book: str
    chapter: int
    verse_number: int
    text_en: str
    text_te: Optional[str] = None
    is_daily: bool = False


class BibleVerseUpdate(BaseModel):
    text_en: Optional[str] = None
    text_te: Optional[str] = None
    is_daily: Optional[bool] = None

@router.get("/daily")
def daily_bible(user=Depends(get_current_user)):
    verse_of_the_day = get_daily_verse()
    return {
        "verse_of_the_day": verse_of_the_day,
        "verses": DAILY_VERSES,
    }

@router.get("/books")
def bible_books(user=Depends(get_current_user)):
    return {"books": get_books()}

@router.get("/chapters")
def book_chapters(book: str = Query(..., description="Bible book name"), user=Depends(get_current_user)):
    chapters = get_chapters(book)
    if not chapters:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"book": book, "chapters": chapters}

@router.get("/db/verses")
def get_bible_verses_from_db(
    book: str = Query(None, description="Filter by book name"),
    chapter: int = Query(None, description="Filter by chapter number"),
    limit: int = Query(50, description="Limit results"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get Bible verses from database (dynamic storage)"""
    query = db.query(BibleVerse).filter(BibleVerse.is_deleted == False)

    if book:
        query = query.filter(BibleVerse.book == book)
    if chapter:
        query = query.filter(BibleVerse.chapter == chapter)

    verses = query.limit(limit).all()

    return {
        "count": len(verses),
        "verses": [
            {
                "id": str(v.id),
                "book": v.book,
                "chapter": v.chapter,
                "verse_number": v.verse_number,
                "text_en": v.text_en,
                "text_te": v.text_te,
                "is_daily": v.is_daily,
                "created_at": v.created_at
            } for v in verses
        ]
    }

@router.get("/passage")
def bible_passage(
    book: str = Query(..., description="Bible book name"),
    chapter: int = Query(..., description="Bible chapter number"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get Bible passage from database"""
    verses = db.query(BibleVerse).filter(
        BibleVerse.book == book,
        BibleVerse.chapter == chapter,
        BibleVerse.is_deleted == False
    ).order_by(BibleVerse.verse_number).all()

    if not verses:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter} not found in book {book}")

    return {
        "book": book,
        "chapter": chapter,
        "verses": [
            {
                "number": v.verse_number,
                "text": v.text_en
            } for v in verses
        ]
    }


# Admin CRUD endpoints for Bible verses

@router.post("/verses", response_model=dict)
async def create_verse(
    verse: BibleVerseCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Create a new Bible verse (Admin only)"""
    try:
        # Check if verse already exists
        existing_verse = db.query(BibleVerse).filter(
            BibleVerse.book == verse.book,
            BibleVerse.chapter == verse.chapter,
            BibleVerse.verse_number == verse.verse_number
        ).first()

        if existing_verse:
            raise HTTPException(status_code=400, detail="Verse already exists")

        new_verse = BibleVerse(
            book=verse.book,
            chapter=verse.chapter,
            verse_number=verse.verse_number,
            text_en=verse.text_en,
            text_te=verse.text_te,
            is_daily=verse.is_daily
        )

        db.add(new_verse)
        db.commit()
        db.refresh(new_verse)

        # Log admin action
        client_ip = request.client.host if request.client else None
        log_admin_action(
            db=db,
            admin_id=str(current_user.id),
            action=f"Created Bible verse: {verse.book} {verse.chapter}:{verse.verse_number}",
            ip_address=client_ip
        )

        return {"message": "Verse created successfully", "verse_id": new_verse.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating verse: {str(e)}")


@router.put("/verses/{verse_id}", response_model=dict)
async def update_verse(
    verse_id: UUID,
    verse_update: BibleVerseUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    verse = db.query(BibleVerse).filter(BibleVerse.id == verse_id).first()

    if not verse:
        raise HTTPException(status_code=404, detail="Verse not found")

    try:
        update_data = verse_update.dict(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(verse, field):
                setattr(verse, field, value)

        db.commit()
        db.refresh(verse)

        # Safe logging
        client_ip = request.client.host if request.client else None
        log_admin_action(
            db=db,
            admin_id=str(current_user.id),
            action=f"Updated Bible verse: {verse.book} {verse.chapter}:{verse.verse_number}",
            ip_address=client_ip
        )

        return {"message": "Verse updated successfully"}

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/verses/{verse_id}", response_model=dict)
async def delete_verse(
    verse_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    """Delete a Bible verse (Admin only)"""
    try:
        verse = db.query(BibleVerse).filter(BibleVerse.id == verse_id).first()
        if not verse:
            raise HTTPException(status_code=404, detail="Verse not found")

        verse_info = f"{verse.book} {verse.chapter}:{verse.verse_number}"

        db.delete(verse)
        db.commit()

        # Log admin action
        client_ip = request.client.host if request.client else None
        log_admin_action(
            db=db,
            admin_id=str(current_user.id),
            action=f"Deleted Bible verse: {verse_info}",
            ip_address=client_ip
        )

        return {"message": "Verse deleted successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting verse: {str(e)}")


@router.get("/verses")
async def get_all_verses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    book: Optional[str] = None,
    chapter: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all Bible verses with optional filtering (Authenticated users only)"""
    query = db.query(BibleVerse)

    if book:
        query = query.filter(BibleVerse.book == book)
    if chapter:
        query = query.filter(BibleVerse.chapter == chapter)

    verses = query.offset(skip).limit(limit).all()

    return [
    {
        "id": str(v.id),
        "book": v.book,
        "chapter": v.chapter,
        "verse_number": v.verse_number,
        "text_en": v.text_en,
        "text_te": v.text_te if v.text_te else "",
        "is_daily": v.is_daily,
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }
    for v in verses
]
