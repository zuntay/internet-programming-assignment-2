import { useEffect, useMemo, useState } from "react";
import { getAllHistory } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminHistory() {
  const { token, user } = useAuth();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const data = await getAllHistory(token);
      setHistory(data);
    } catch (err) {
      setError(err.message || "Failed to load admin history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return history.filter((item) => {
      const matchesSearch =
        !searchText ||
        String(item.username || "").toLowerCase().includes(searchText) ||
        String(item.email || "").toLowerCase().includes(searchText) ||
        String(item.question || "").toLowerCase().includes(searchText) ||
        String(item.userAnswer || "").toLowerCase().includes(searchText) ||
        String(item.category || "").toLowerCase().includes(searchText);

      const matchesResult =
        resultFilter === "all" ||
        (resultFilter === "correct" && item.isCorrect) ||
        (resultFilter === "incorrect" && !item.isCorrect);

      return matchesSearch && matchesResult;
    });
  }, [history, search, resultFilter]);

  const totalAttempts = history.length;
  const correctAttempts = history.filter((item) => item.isCorrect).length;
  const incorrectAttempts = totalAttempts - correctAttempts;
  const accuracy =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return (
    <main className="page">
      <section className="panel">
        <div className="page-heading">
          <div>
            <h1>Admin Learning History</h1>
            <p className="meta">
              View all users’ flashcard study attempts and learning outcomes.
            </p>
            <p className="meta">Signed in as admin: {user?.username}</p>
          </div>

          <button className="secondary-btn" type="button" onClick={loadHistory}>
            Refresh
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="stats-grid">
          <article className="stat-card">
            <span>Total attempts</span>
            <strong>{totalAttempts}</strong>
          </article>

          <article className="stat-card">
            <span>Correct</span>
            <strong>{correctAttempts}</strong>
          </article>

          <article className="stat-card">
            <span>Incorrect</span>
            <strong>{incorrectAttempts}</strong>
          </article>

          <article className="stat-card">
            <span>Accuracy</span>
            <strong>{accuracy}%</strong>
          </article>
        </div>

        <div className="admin-toolbar">
          <div className="form-control">
            <label htmlFor="admin-search">Search history</label>
            <input
              id="admin-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by user, email, question, answer, category..."
            />
          </div>

          <div className="form-control">
            <label htmlFor="result-filter">Result filter</label>
            <select
              id="result-filter"
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value)}
            >
              <option value="all">All attempts</option>
              <option value="correct">Correct only</option>
              <option value="incorrect">Incorrect only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="meta">Loading all learning history...</p>
        ) : filteredHistory.length === 0 ? (
          <p className="meta">No matching history records found.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Question</th>
                  <th>User answer</th>
                  <th>Correct answer</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.viewedAt}</td>
                    <td>
                      <strong>{item.username}</strong>
                      <br />
                      <span className="meta">{item.email}</span>
                    </td>
                    <td>
                      <strong>{item.question}</strong>
                      <br />
                      <span className="meta">
                        {item.category || "Uncategorised"} · {item.difficulty}
                      </span>
                    </td>
                    <td>{item.userAnswer || "(blank)"}</td>
                    <td>{item.correctAnswer}</td>
                    <td>
                      {item.isCorrect ? (
                        <span className="status-good">Correct</span>
                      ) : (
                        <span className="status-bad">Incorrect</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}