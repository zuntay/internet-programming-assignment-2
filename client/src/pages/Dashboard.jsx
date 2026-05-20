import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  return (
    <main className="page">
      <section className="panel hero-panel">
        <p className="eyebrow">Flashcard Learning App</p>
        <h1>Welcome, {user?.username}</h1>
        <p className="hero-text">
          Create your own flashcards, search them instantly, practise through
          study mode, and track learning history through a full-stack React,
          FastAPI, JWT, and MySQL application.
        </p>

        <div className="hero-actions">
          <Link className="primary-btn link-btn" to="/flashcards">
            Manage Flashcards
          </Link>
          <Link className="secondary-btn link-btn" to="/study">
            Start Studying
          </Link>
          {isAdmin && (
            <Link className="secondary-btn link-btn" to="/admin/history">
              View Admin History
            </Link>
          )}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel feature-card">
          <h2>1. Authentication</h2>
          <p>
            Users can register and log in securely. The backend uses password
            hashing and JWT tokens to protect private routes.
          </p>
        </article>

        <article className="panel feature-card">
          <h2>2. Flashcard CRUD</h2>
          <p>
            Users can create, read, update, delete, and live-search their own
            flashcards without leaving the single-page interface.
          </p>
        </article>

        <article className="panel feature-card">
          <h2>3. Study Mode</h2>
          <p>
            Users can answer flashcards, reveal the correct answer, and save
            each attempt into their learning history.
          </p>
        </article>

        <article className="panel feature-card">
          <h2>4. Admin History</h2>
          <p>
            Admin users can view all users’ study attempts, filter results, and
            inspect learning performance across the app.
          </p>
        </article>
      </section>
    </main>
  );
}
