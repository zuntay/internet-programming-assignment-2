import { useEffect, useMemo, useState } from "react";
import { createHistory, getFlashcards, getMyHistory } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function normaliseAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export default function Study() {
  const { token } = useAuth();

  const [flashcards, setFlashcards] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const currentCard = flashcards[currentIndex] || null;

  const progressText = useMemo(() => {
    if (!flashcards.length) return "No cards loaded";
    return `Card ${currentIndex + 1} of ${flashcards.length}`;
  }, [flashcards.length, currentIndex]);

  useEffect(() => {
    loadStudyData();
  }, []);

  async function loadStudyData() {
    setLoading(true);
    setHistoryLoading(true);
    setError("");

    try {
      const [cardsData, historyData] = await Promise.all([
        getFlashcards(token),
        getMyHistory(token),
      ]);

      setFlashcards(cardsData);
      setHistory(historyData);
      setCurrentIndex(0);
      setUserAnswer("");
      setRevealed(false);
      setLastResult(null);
    } catch (err) {
      setError(err.message || "Failed to load study data");
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }

  async function refreshHistory() {
    setHistoryLoading(true);

    try {
      const data = await getMyHistory(token);
      setHistory(data);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleRevealAndCheck() {
    if (!currentCard) return;

    const user = normaliseAnswer(userAnswer);
    const correct = normaliseAnswer(currentCard.answer);
    const isCorrect = user.length > 0 && user === correct;

    setRevealed(true);
    setLastResult(isCorrect);

    try {
      await createHistory(token, {
        flashcardId: currentCard.id,
        userAnswer,
        isCorrect,
      });

      await refreshHistory();
    } catch (err) {
      setError(err.message || "Failed to save study history");
    }
  }

  function handleNextCard() {
    if (!flashcards.length) return;

    const nextIndex = (currentIndex + 1) % flashcards.length;

    setCurrentIndex(nextIndex);
    setUserAnswer("");
    setRevealed(false);
    setLastResult(null);
    setError("");
  }

  function handlePreviousCard() {
    if (!flashcards.length) return;

    const previousIndex =
      currentIndex === 0 ? flashcards.length - 1 : currentIndex - 1;

    setCurrentIndex(previousIndex);
    setUserAnswer("");
    setRevealed(false);
    setLastResult(null);
    setError("");
  }

  function jumpToCard(index) {
    setCurrentIndex(index);
    setUserAnswer("");
    setRevealed(false);
    setLastResult(null);
    setError("");
  }

  return (
    <main className="page">
      <section className="panel">
        <div className="page-heading">
          <div>
            <h1>Study</h1>
            <p className="meta">
              Practise your flashcards and automatically save your learning
              history.
            </p>
          </div>

          <button className="secondary-btn" type="button" onClick={loadStudyData}>
            Reload cards
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="meta">Loading study cards...</p>
        ) : !currentCard ? (
          <div className="empty-state">
            <h2>No flashcards available</h2>
            <p className="meta">
              Go to the Flashcards page and create a card before studying.
            </p>
          </div>
        ) : (
          <div className="study-layout">
            <aside className="study-sidebar">
              <h2>Study queue</h2>
              <p className="meta">{progressText}</p>

              <div className="study-card-list">
                {flashcards.map((card, index) => (
                  <button
                    key={card.id}
                    className={
                      index === currentIndex
                        ? "study-list-btn active"
                        : "study-list-btn"
                    }
                    type="button"
                    onClick={() => jumpToCard(index)}
                  >
                    <span>{card.question}</span>
                    <small>
                      {card.category || "Uncategorised"} · {card.difficulty}
                    </small>
                  </button>
                ))}
              </div>
            </aside>

            <section className="study-main">
              <p className="meta">{progressText}</p>

              <article className="study-card-panel">
                <p className="meta">
                  {currentCard.category || "Uncategorised"} ·{" "}
                  {currentCard.difficulty}
                </p>

                <h2>{currentCard.question}</h2>

                <div className="form-control">
                  <label htmlFor="study-answer">Your answer</label>
                  <textarea
                    id="study-answer"
                    rows="3"
                    value={userAnswer}
                    onChange={(event) => setUserAnswer(event.target.value)}
                    placeholder="Type your answer before revealing..."
                    disabled={revealed}
                  />
                </div>

                <div className="item-actions">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={handleRevealAndCheck}
                    disabled={revealed}
                  >
                    Reveal + Check
                  </button>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={handlePreviousCard}
                  >
                    Previous
                  </button>

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={handleNextCard}
                  >
                    Next
                  </button>
                </div>

                {revealed && (
                  <div className="answer-panel">
                    {lastResult ? (
                      <p className="success-text">Correct ✅</p>
                    ) : (
                      <p className="error-text">
                        Not quite — compare your answer with the correct answer.
                      </p>
                    )}

                    <h3>Correct answer</h3>
                    <p>{currentCard.answer}</p>
                  </div>
                )}
              </article>
            </section>
          </div>
        )}
      </section>

      <section className="panel history-panel">
        <h2>My Learning History</h2>
        <p className="meta">
          Recent study attempts are saved when you reveal and check an answer.
        </p>

        {historyLoading ? (
          <p className="meta">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="meta">No study history yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Question</th>
                  <th>Your answer</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {history.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td>{item.viewedAt}</td>
                    <td>{item.question}</td>
                    <td>{item.userAnswer || "(blank)"}</td>
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