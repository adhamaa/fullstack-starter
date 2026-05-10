import mysql.connector
from redis import Redis
from .settings import settings


def check_mysql() -> bool:
    try:
        connection = mysql.connector.connect(
            host=settings.mysql_host,
            port=settings.mysql_port,
            database=settings.mysql_database,
            user=settings.mysql_user,
            password=settings.mysql_password,
            connection_timeout=2,
        )
        connection.close()
        return True
    except Exception:
        return False


def check_redis() -> bool:
    try:
        client = Redis.from_url(settings.redis_url, socket_connect_timeout=2)
        return bool(client.ping())
    except Exception:
        return False
