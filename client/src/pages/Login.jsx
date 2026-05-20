import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form.username.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="panel auth-panel">
        <h1>Login</h1>
        <p className="meta">Sign in to manage and study your flashcards.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="meta">
          No account yet? <Link to="/register">Create one here</Link>.
        </p>
      </section>
    </main>
  );
}