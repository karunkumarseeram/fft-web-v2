import os
from typing import Optional
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ================= ENV =================
    ENV: str = "dev"

    # ================= LOCAL DB =================
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DEV_DB_NAME: Optional[str] = None

    # ================= PROD DB =================
    PROD_DATABASE_URL: Optional[str] = None

    # ================= SECURITY =================
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ================= DB SWITCH =================
    @property
    def DATABASE_URL(self) -> str:

        # ===== LOCAL DEV =====
        if self.ENV == "dev":

            if not all([self.DB_USER, self.DB_PASSWORD, self.DEV_DB_NAME]):
                raise ValueError("Missing local DB config in .env")

            password = quote_plus(self.DB_PASSWORD)

            return (
                f"postgresql://"
                f"{self.DB_USER}:{password}"
                f"@{self.DB_HOST}:{self.DB_PORT}"
                f"/{self.DEV_DB_NAME}"
            )

        # ===== PROD (NEON) =====
        if self.ENV == "prod":

            if not self.PROD_DATABASE_URL:
                raise ValueError("Missing PROD_DATABASE_URL in .env")

            return self.PROD_DATABASE_URL

        raise ValueError("ENV must be 'dev' or 'prod'")


settings = Settings()

print("ENV:", settings.ENV)
print("Running on dev or prod:", "dev" if settings.ENV == "dev" else "prod")