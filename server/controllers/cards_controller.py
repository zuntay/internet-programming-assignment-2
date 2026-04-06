from typing import Optional
from server.db import get_connection

def row_to_card(row):
	# row order must match SELECT columns
	return {
		"id": row[0],
		"question": row[1],
		"answer": row[2],
		"tags": row[3],
		"createdAt": row[4].isoformat() if row[4] else None,
		"updatedAt": row[5].isoformat() if row[5] else None,
	}


def list_cards():
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		SELECT id, question, answer, tags, created_at, updated_at
		FROM cards
		ORDER BY updated_at DESC;
		"""
	)
	rows = cur.fetchall()
	cur.close()
	conn.close()
	return [row_to_card(r) for r in rows]


def get_card(card_id: int):
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		SELECT id, question, answer, tags, created_at, updated_at
		FROM cards
		WHERE id = %s;
		""",
		(card_id,),
	)
	row = cur.fetchone()
	cur.close()
	conn.close()
	return row_to_card(row) if row else None


def create_card(question: str, answer: str, tags: Optional[str]):
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		INSERT INTO cards (question, answer, tags)
		VALUES (%s, %s, %s);
		""",
		(question, answer, tags),
	)
	conn.commit()
	new_id = cur.lastrowid
	cur.close()
	conn.close()
	return get_card(new_id)


def update_card(card_id: int, question: str, answer: str, tags: Optional[str]):
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		UPDATE cards
		SET question = %s, answer = %s, tags = %s
		WHERE id = %s;
		""",
		(question, answer, tags, card_id),
	)
	conn.commit()
	affected = cur.rowcount
	cur.close()
	conn.close()
	return get_card(card_id) if affected else None


def delete_card(card_id: int):
	conn = get_connection()
	cur = conn.cursor()
	cur.execute("DELETE FROM cards WHERE id = %s;", (card_id,))
	conn.commit()
	affected = cur.rowcount
	cur.close()
	conn.close()
	return affected > 0