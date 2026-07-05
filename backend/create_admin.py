import uuid

from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.chr_models import User, RoleEnum


def create_admin():
    db = SessionLocal()

    try:
        print("===================================")
        print("ENV:", settings.ENV)
        print("DB :", settings.DATABASE_URL)
        print("===================================")

        admin_email = "karunkumarseeram@gmail.com"
        admin_password = "SuperSecretPassword123!"

        existing = db.query(User).filter(User.email == admin_email).first()

        if existing:
            print("⚠️ Admin already exists in PROD DB")
            return

        new_admin = User(
            id=uuid.uuid4(),
            name="Admin",
            email=admin_email,
            phone="1234567890",
            hashed_password=hash_password(admin_password),
            role=RoleEnum.ADMIN,
            is_active=True,
            is_approved=True,
        )

        db.add(new_admin)
        db.commit()

        print("✅ Admin created successfully in PROD DB")

    except Exception as e:
        db.rollback()
        print("❌ Error:", str(e))

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()