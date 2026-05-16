from dataclasses import dataclass
from os import getenv
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    flask_port: int = int(getenv("FLASK_PORT", "5000"))
    database_url: str = getenv(
        "DATABASE_URL",
        "postgresql://app:app_password@localhost:5432/app_db",
    )
    redis_url: str = getenv("REDIS_URL", "redis://localhost:6379")


settings = Settings()
