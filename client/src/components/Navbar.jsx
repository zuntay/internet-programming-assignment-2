import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/dashboard">
        Flashcard Learning App
      </Link>

      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/flashcards">Flashcards</NavLink>
            <NavLink to="/study">Study</NavLink>

            {isAdmin && <NavLink to="/admin/history">Admin History</NavLink>}

            <span className="user-pill">{user?.username}</span>
            <button className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}