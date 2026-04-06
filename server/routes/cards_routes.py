from flask import Blueprint, jsonify, request

from server.controllers.cards_controller import (
	list_cards,
	get_card,
	create_card,
	update_card,
	delete_card,
)

cards_bp = Blueprint("cards", __name__)


@cards_bp.get("/api/cards")
def http_list_cards():
	return jsonify(list_cards())


@cards_bp.get("/api/cards/<int:card_id>")
def http_get_card(card_id):
	card = get_card(card_id)
	if not card:
		return jsonify({"error": "Card not found"}), 404
	return jsonify(card)


@cards_bp.post("/api/cards")
def http_create_card():
	data = request.get_json(silent=True) or {}
	question = (data.get("question") or "").strip()
	answer = (data.get("answer") or "").strip()
	tags = (data.get("tags") or "").strip() or None

	if not question or not answer:
		return jsonify({"error": "question and answer are required"}), 400

	card = create_card(question, answer, tags)
	return jsonify(card), 201


@cards_bp.put("/api/cards/<int:card_id>")
def http_update_card(card_id):
	data = request.get_json(silent=True) or {}
	question = (data.get("question") or "").strip()
	answer = (data.get("answer") or "").strip()
	tags = (data.get("tags") or "").strip() or None

	if not question or not answer:
		return jsonify({"error": "question and answer are required"}), 400

	card = update_card(card_id, question, answer, tags)
	if not card:
		return jsonify({"error": "Card not found"}), 404
	return jsonify(card)


@cards_bp.delete("/api/cards/<int:card_id>")
def http_delete_card(card_id):
	ok = delete_card(card_id)
	if not ok:
		return jsonify({"error": "Card not found"}), 404
	return jsonify({"deleted": True})