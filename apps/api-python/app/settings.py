from dataclasses import dataclass
from os import getenv
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    flask_port: int = int(getenv("FLASK_PORT", "5000"))
    mysql_host: str = getenv("MYSQL_HOST", "localhost")
    mysql_port: int = int(getenv("MYSQL_PORT", "3306"))
    mysql_database: str = getenv("MYSQL_DATABASE", "app_db")
    mysql_user: str = getenv("MYSQL_USER", "app")
    mysql_password: str = getenv("MYSQL_PASSWORD", "app_password")
    redis_url: str = getenv("REDIS_URL", "redis://localhost:6379")


settings = Settings()
