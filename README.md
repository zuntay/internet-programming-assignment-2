## Tech stack

- Frontend: HTML, CSS, JavaScript (single-page app)
- Backend: Python + Flask
- Database: MySQL

---

# How to run locally (marker instructions)

## A) Prerequisites

1. Python 3 installed
2. MySQL installed and running

---

## B) Database setup (MySQL)

### B1) Create/import the database

This repo includes a database export file:

- `database/export/flashcards.sql`

Import it into MySQL (recommended method: terminal):

1. Open a terminal in the project root folder.
2. Run:
    - `/usr/local/mysql/bin/mysql -u root -p < database/export/flashcards.sql`
3. Enter the MySQL password when prompted.

If you prefer importing inside MySQL:

1. Open MySQL:
    - `/usr/local/mysql/bin/mysql -u root -p`
2. Run:
    - `SOURCE /full/path/to/this/repo/database/export/flashcards.sql;`

### B2) Confirm the database exists

Inside MySQL:

- `SHOW DATABASES;`
- `USE flashcards;`
- `SHOW TABLES;` (should include `cards`)

---

## C) Backend setup (Flask API)

### C1) Create `.env` (do not commit)

Create a file named `.env` in the project root (same level as `client/`, `server/`, `database/`).

Example `.env`:

- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=YOUR_PASSWORD_HERE`
- `DB_NAME=flashcards`
- `PORT=3000`

### C2) Install Python dependencies

In the project root:

1. Create and activate a virtual environment (recommended):
    - `python3 -m venv .venv`
    - `source .venv/bin/activate`
2. Install dependencies:
    - `pip install -r server/requirements.txt`

### C3) Run the backend

In the project root (venv activated):

- `python3 -m server.app`

Expected: server runs at

- `http://127.0.0.1:3000`

Quick API checks:

- `http://127.0.0.1:3000/api/health`
- `http://127.0.0.1:3000/api/cards`

---

## D) Frontend setup (SPA)

### D1) Run a static server

Open a second terminal in the project root:

- `python3 -m http.server 8000`

### D2) Open the app in a browser

Open:

- `http://127.0.0.1:8000/client/`

---

# App features

## Manage Cards (CRUD)

- Create a card (question, answer, optional tags)
- List cards
- Edit a card
- Delete a card

## Study mode

- Load cards into a study queue
- See all questions in a scrollable list and click to jump to a specific card
- Type an answer, then click “Reveal + check my answer”
- After revealing, clicking “Next card” removes that card from the study queue (disappears after use)

---

# API endpoints

- `GET /api/health`
- `GET /api/cards`
- `GET /api/cards/<id>`
- `POST /api/cards`
- `PUT /api/cards/<id>`
- `DELETE /api/cards/<id>`

---

# Notes

- `.env` is required locally but must not be committed.
- If ports 3000 or 8000 are in use, free the port or change the PORT values consistently.
