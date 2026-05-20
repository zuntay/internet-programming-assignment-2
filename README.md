# Flashcard Learning App

A full-stack flashcard learning web application built for Internet Programming Assignment 2.

The application allows users to register, log in, create and manage flashcards, study cards, and record learning history. Admin users can view all users' learning history.

---

## Tech Stack

- Frontend: React + Vite
- Routing: React Router
- Backend: Python + FastAPI
- Database: MySQL
- Authentication: JWT + bcrypt password hashing
- API style: RESTful API

---

## Main Features

### User Authentication

- Register a new account
- Log in with username and password
- Passwords are stored as hashed values
- JWT token is used for protected routes
- Authenticated users can access dashboard, flashcards, and study pages

### Flashcard CRUD

Users can:

- Create flashcards
- View their own flashcards
- Search flashcards in real time
- Edit flashcards
- Delete flashcards

### Study Mode

Users can:

- Load their flashcards into a study queue
- Type an answer
- Reveal and check the correct answer
- Save each study attempt into learning history
- View their recent personal learning history

### Admin Learning History

Admin users can:

- View all users' learning history
- Search history records
- Filter attempts by correct or incorrect result
- See total attempts, correct attempts, incorrect attempts, and accuracy

---

## Database Entities

The project uses three main database entities:

1. `users`
2. `flashcards`
3. `view_history`

Relationship summary:

- A user can own many flashcards.
- A user can have many learning history records.
- A flashcard can appear in many learning history records.

---

## Local Setup Instructions

### A) Prerequisites

Make sure you have installed:

- Python 3
- Node.js and npm
- MySQL Server

Also make sure MySQL Server is running before starting the backend.

---

## B) Database Setup

This project uses MySQL.

From the project root, run:

```bash
/usr/local/mysql/bin/mysql -u root -p < database/mysql_schema.sql