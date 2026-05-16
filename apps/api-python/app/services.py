import psycopg
from redis import Redis
from .settings import settings


def check_database() -> bool:
    try:
        with psycopg.connect(settings.database_url, connect_timeout=2) as connection:
            connection.execute("SELECT 1")
        return True
    except Exception:
        return False


def check_redis() -> bool:
    try:
        client = Redis.from_url(settings.redis_url, socket_connect_timeout=2)
        return bool(client.ping())
    except Exception:
        return False
