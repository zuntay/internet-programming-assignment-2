from server.db import get_connection


def row_to_history(row: dict):
    return {
        "id": row["id"],
        "userId": row["user_id"],
        "flashcardId": row["flashcard_id"],
        "userAnswer": row["user_answer"],
        "isCorrect": bool(row["is_correct"]),
        "viewedAt": row["viewed_at"].isoformat() if row.get("viewed_at") else None,
        "username": row.get("username"),
        "email": row.get("email"),
        "question": row.get("question"),
        "correctAnswer": row.get("correct_answer"),
        "category": row.get("category"),
        "difficulty": row.get("difficulty"),
    }


def create_history(user_id: int, flashcard_id: int, user_answer: str, is_correct: bool):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        SELECT id
        FROM flashcards
        WHERE id = %s AND user_id = %s;
        """,
        (flashcard_id, user_id),
    )

    flashcard = cur.fetchone()

    if not flashcard:
        cur.close()
        conn.close()
        return None

    cur.execute(
        """
        INSERT INTO view_history (user_id, flashcard_id, user_answer, is_correct)
        VALUES (%s, %s, %s, %s);
        """,
        (user_id, flashcard_id, user_answer, is_correct),
    )

    conn.commit()
    new_id = cur.lastrowid

    cur.execute(
        """
        SELECT
            vh.id,
            vh.user_id,
            vh.flashcard_id,
            vh.user_answer,
            vh.is_correct,
            vh.viewed_at,
            f.question,
            f.answer AS correct_answer,
            f.category,
            f.difficulty
        FROM view_history vh
        JOIN flashcards f ON vh.flashcard_id = f.id
        WHERE vh.id = %s;
        """,
        (new_id,),
    )

    row = cur.fetchone()
    cur.close()
    conn.close()

    return row_to_history(row)


def list_my_history(user_id: int):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        SELECT
            vh.id,
            vh.user_id,
            vh.flashcard_id,
            vh.user_answer,
            vh.is_correct,
            vh.viewed_at,
            f.question,
            f.answer AS correct_answer,
            f.category,
            f.difficulty
        FROM view_history vh
        JOIN flashcards f ON vh.flashcard_id = f.id
        WHERE vh.user_id = %s
        ORDER BY vh.viewed_at DESC;
        """,
        (user_id,),
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [row_to_history(row) for row in rows]


def list_all_history():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        SELECT
            vh.id,
            vh.user_id,
            vh.flashcard_id,
            vh.user_answer,
            vh.is_correct,
            vh.viewed_at,
            u.username,
            u.email,
            f.question,
            f.answer AS correct_answer,
            f.category,
            f.difficulty
        FROM view_history vh
        JOIN users u ON vh.user_id = u.id
        JOIN flashcards f ON vh.flashcard_id = f.id
        ORDER BY vh.viewed_at DESC;
        """
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [row_to_history(row) for row in rows]


def delete_history(history_id: int, user_id: int, is_admin: bool = False):
    conn = get_connection()
    cur = conn.cursor()

    if is_admin:
        cur.execute(
            """
            DELETE FROM view_history
            WHERE id = %s;
            """,
            (history_id,),
        )
    else:
        cur.execute(
            """
            DELETE FROM view_history
            WHERE id = %s AND user_id = %s;
            """,
            (history_id, user_id),
        )

    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()

    return affected > 0