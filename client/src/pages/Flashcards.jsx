import { useEffect, useState } from "react";
import {
  createFlashcard,
  deleteFlashcard,
  getFlashcards,
  updateFlashcard,
} from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  question: "",
  answer: "",
  category: "",
  difficulty: "medium",
};

export default function Flashcards() {
  const { token } = useAuth();

  const [flashcards, setFlashcards] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadFlashcards(search);
  }, [search]);

  async function loadFlashcards(searchText = "") {
    setLoading(true);
    setError("");

    try {
      const data = await getFlashcards(token, searchText);
      setFlashcards(data);
    } catch (err) {
      setError(err.message || "Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleEditFormChange(event) {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createFlashcard(token, {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || null,
        difficulty: form.difficulty,
      });

      setForm(emptyForm);
      setMessage("Flashcard created.");
      await loadFlashcards(search);
    } catch (err) {
      setError(err.message || "Failed to create flashcard");
    }
  }

  function startEdit(card) {
    setEditingId(card.id);
    setEditForm({
      question: card.question,
      answer: card.answer,
      category: card.category || "",
      difficulty: card.difficulty || "medium",
    });
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleUpdate(cardId) {
    setMessage("");
    setError("");

    try {
      await updateFlashcard(token, cardId, {
        question: editForm.question.trim(),
        answer: editForm.answer.trim(),
        category: editForm.category.trim() || null,
        difficulty: editForm.difficulty,
      });

      setEditingId(null);
      setEditForm(emptyForm);
      setMessage("Flashcard updated.");
      await loadFlashcards(search);
    } catch (err) {
      setError(err.message || "Failed to update flashcard");
    }
  }

  async function handleDelete(cardId) {
    const confirmed = window.confirm("Delete this flashcard?");
    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await deleteFlashcard(token, cardId);
      setMessage("Flashcard deleted.");
      await loadFlashcards(search);
    } catch (err) {
      setError(err.message || "Failed to delete flashcard");
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Flashcards</h1>
        <p className="meta">
          Create, search, edit, and delete your learning cards.
        </p>

        <form className="form-grid create-card-form" onSubmit={handleCreate}>
          <div className="form-control">
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              name="question"
              rows="2"
              value={form.question}
              onChange={handleFormChange}
              placeholder="Enter the question"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="answer">Answer</label>
            <textarea
              id="answer"
              name="answer"
              rows="2"
              value={form.answer}
              onChange={handleFormChange}
              placeholder="Enter the answer"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-control">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                placeholder="e.g. React, SQL, Security"
              />
            </div>

            <div className="form-control">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleFormChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button className="primary-btn" type="submit">
            Create Flashcard
          </button>
        </form>

        <div className="divider" />

        <div className="toolbar">
          <div className="form-control search-box">
            <label htmlFor="search">Live search</label>
            <input
              id="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search question, answer, category, or difficulty..."
            />
          </div>
        </div>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        {loading && <p className="meta">Loading flashcards...</p>}

        <div className="card-grid">
          {!loading && flashcards.length === 0 && (
            <p className="meta">No flashcards found.</p>
          )}

          {flashcards.map((card) => (
            <article className="flashcard-item" key={card.id}>
              {editingId === card.id ? (
                <div className="form-grid">
                  <div className="form-control">
                    <label>Question</label>
                    <textarea
                      name="question"
                      rows="2"
                      value={editForm.question}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="form-control">
                    <label>Answer</label>
                    <textarea
                      name="answer"
                      rows="2"
                      value={editForm.answer}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-control">
                      <label>Category</label>
                      <input
                        name="category"
                        value={editForm.category}
                        onChange={handleEditFormChange}
                      />
                    </div>

                    <div className="form-control">
                      <label>Difficulty</label>
                      <select
                        name="difficulty"
                        value={editForm.difficulty}
                        onChange={handleEditFormChange}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => handleUpdate(card.id)}
                    >
                      Save
                    </button>
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="meta">
                    {card.category || "Uncategorised"} · {card.difficulty}
                  </p>
                  <h2>{card.question}</h2>
                  <p>{card.answer}</p>

                  <div className="item-actions">
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={() => startEdit(card)}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => handleDelete(card.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}