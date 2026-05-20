from typing import Optional

from server.db import get_connection


def row_to_flashcard(row: dict):
    return {
        "id": row["id"],
        "userId": row["user_id"],
        "question": row["question"],
        "answer": row["answer"],
        "category": row["category"],
        "difficulty": row["difficulty"],
        "createdAt": row["created_at"].isoformat() if row.get("created_at") else None,
        "updatedAt": row["updated_at"].isoformat() if row.get("updated_at") else None,
    }


def list_flashcards(user_id: int, search: Optional[str] = None):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    if search:
        like_search = f"%{search}%"
        cur.execute(
            """
            SELECT id, user_id, question, answer, category, difficulty, created_at, updated_at
            FROM flashcards
            WHERE user_id = %s
              AND (
                question LIKE %s
                OR answer LIKE %s
                OR category LIKE %s
                OR difficulty LIKE %s
              )
            ORDER BY updated_at DESC;
            """,
            (user_id, like_search, like_search, like_search, like_search),
        )
    else:
        cur.execute(
            """
            SELECT id, user_id, question, answer, category, difficulty, created_at, updated_at
            FROM flashcards
            WHERE user_id = %s
            ORDER BY updated_at DESC;
            """,
            (user_id,),
        )

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [row_to_flashcard(row) for row in rows]


def get_flashcard(card_id: int, user_id: int):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        SELECT id, user_id, question, answer, category, difficulty, created_at, updated_at
        FROM flashcards
        WHERE id = %s AND user_id = %s;
        """,
        (card_id, user_id),
    )

    row = cur.fetchone()
    cur.close()
    conn.close()

    return row_to_flashcard(row) if row else None


def create_flashcard(
    user_id: int,
    question: str,
    answer: str,
    category: Optional[str],
    difficulty: str,
):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        INSERT INTO flashcards (user_id, question, answer, category, difficulty)
        VALUES (%s, %s, %s, %s, %s);
        """,
        (user_id, question, answer, category, difficulty),
    )

    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()

    return get_flashcard(new_id, user_id)


def update_flashcard(
    card_id: int,
    user_id: int,
    question: str,
    answer: str,
    category: Optional[str],
    difficulty: str,
):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)

    cur.execute(
        """
        UPDATE flashcards
        SET question = %s,
            answer = %s,
            category = %s,
            difficulty = %s
        WHERE id = %s AND user_id = %s;
        """,
        (question, answer, category, difficulty, card_id, user_id),
    )

    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()

    return get_flashcard(card_id, user_id) if affected else None


def delete_flashcard(card_id: int, user_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        DELETE FROM flashcards
        WHERE id = %s AND user_id = %s;
        """,
        (card_id, user_id),
    )

    conn.commit()
    affected = cur.rowcount
    cur.close()
    conn.close()

    return affected > 0