import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from server.routes.cards_routes import cards_bp
from server.db import get_connection

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(cards_bp)


@app.get("/api/health")
def health():
	return {"status": "ok"}


@app.get("/api/db-test")
def db_test():
	conn = get_connection()
	cur = conn.cursor()
	cur.execute("SELECT 1")
	(value,) = cur.fetchone()
	cur.close()
	conn.close()
	return {"db": "ok", "value": value}

print("Reached bottom of file")
if __name__ == "__main__":
	port = int(os.getenv("PORT", "3000"))
	app.run(host="127.0.0.1", port=port, debug=True)
	