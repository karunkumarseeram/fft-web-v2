#!/usr/bin/env python3
"""
Script to populate the bible_verses table with data from bible_data.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.chr_models import BibleVerse
from app.bible_data import BIBLE_BOOKS
import uuid
from datetime import datetime

def populate_bible_verses():
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_count = db.query(BibleVerse).count()
        if existing_count > 0:
            print(f"Bible verses table already has {existing_count} records. Skipping population.")
            return

        verses_added = 0

        for book_name, chapters in BIBLE_BOOKS.items():
            for chapter_num, verses in chapters.items():
                for verse_num, text in enumerate(verses, 1):
                    # Create BibleVerse record
                    bible_verse = BibleVerse(
                        id=uuid.uuid4(),
                        book=book_name,
                        chapter=chapter_num,
                        verse_number=verse_num,
                        text_en=text,
                        text_te=None,  # No Telugu text in current data
                        is_daily=False,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                        is_deleted=False
                    )
                    db.add(bible_verse)
                    verses_added += 1

        db.commit()
        print(f"Successfully added {verses_added} Bible verses to the database.")

    except Exception as e:
        db.rollback()
        print(f"Error populating Bible verses: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate_bible_verses()