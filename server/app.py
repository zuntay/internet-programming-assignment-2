import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.db import get_connection
from server.routes.auth_routes import router as auth_router
from server.routes.flashcards_routes import router as flashcards_router
from server.routes.history_routes import router as history_router

load_dotenv()

app = FastAPI(title="Flashcard Learning App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(flashcards_router)
app.include_router(history_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "backend": "FastAPI"}


@app.get("/api/db-test")
def db_test():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT 1")
    (value,) = cur.fetchone()
    cur.close()
    conn.close()
    return {"db": "ok", "value": value}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3000"))
    uvicorn.run("server.app:app", host="127.0.0.1", port=port, reload=True)