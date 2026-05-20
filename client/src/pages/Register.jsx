import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
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
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="panel auth-panel">
        <h1>Create account</h1>
        <p className="meta">Register to create flashcards and track your study history.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="At least 3 characters"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="meta">
          Already have an account? <Link to="/login">Login here</Link>.
        </p>
      </section>
    </main>
  );
}