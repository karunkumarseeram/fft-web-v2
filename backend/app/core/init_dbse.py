from app.core.database import Base, engine

def init_db():
    # from app.models.chr_models import User, Member, Event, Donation, Verse, PrayerRequest, AdminActionLog
    from app.models.chr_models import User, Member, Event, EventAttendance, Donation, Verse, BibleVerse, PrayerRequest, AdminActionLog, OTP
    Base.metadata.create_all(bind=engine)