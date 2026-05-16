from datetime import datetime, timezone
from flask import Flask, jsonify
from flask_cors import CORS
from .services import check_database, check_redis


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

    @app.get("/health")
    def health():
        dependencies = {
            "database": "ok" if check_database() else "error",
            "redis": "ok" if check_redis() else "error",
        }

        return jsonify(
            {
                "service": "api-python",
                "status": "ok" if all(value == "ok" for value in dependencies.values()) else "degraded",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "dependencies": dependencies,
            }
        )

    return app
