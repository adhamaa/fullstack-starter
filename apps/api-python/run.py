from app.main import create_app
from app.settings import settings

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.flask_port, debug=True, use_reloader=False)
