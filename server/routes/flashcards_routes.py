from typing import Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from server.auth import get_current_user
from server.controllers.flashcards_controller import (
    list_flashcards,
    get_flashcard,
    create_flashcard,
    update_flashcard,
    delete_flashcard,
)


router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])


class FlashcardRequest(BaseModel):
    question: str = Field(min_length=1, max_length=255)
    answer: str = Field(min_length=1)
    category: Optional[str] = Field(default=None, max_length=100)
    difficulty: Literal["easy", "medium", "hard"] = "medium"


@router.get("")
def http_list_flashcards(
    search: Optional[str] = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    return list_flashcards(user_id=current_user["id"], search=search)


@router.get("/{card_id}")
def http_get_flashcard(
    card_id: int,
    current_user: dict = Depends(get_current_user),
):
    card = get_flashcard(card_id=card_id, user_id=current_user["id"])

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return card


@router.post("")
def http_create_flashcard(
    data: FlashcardRequest,
    current_user: dict = Depends(get_current_user),
):
    question = data.question.strip()
    answer = data.answer.strip()
    category = data.category.strip() if data.category else None

    if not question or not answer:
        raise HTTPException(status_code=400, detail="Question and answer are required")

    return create_flashcard(
        user_id=current_user["id"],
        question=question,
        answer=answer,
        category=category,
        difficulty=data.difficulty,
    )


@router.put("/{card_id}")
def http_update_flashcard(
    card_id: int,
    data: FlashcardRequest,
    current_user: dict = Depends(get_current_user),
):
    question = data.question.strip()
    answer = data.answer.strip()
    category = data.category.strip() if data.category else None

    if not question or not answer:
        raise HTTPException(status_code=400, detail="Question and answer are required")

    card = update_flashcard(
        card_id=card_id,
        user_id=current_user["id"],
        question=question,
        answer=answer,
        category=category,
        difficulty=data.difficulty,
    )

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return card


@router.delete("/{card_id}")
def http_delete_flashcard(
    card_id: int,
    current_user: dict = Depends(get_current_user),
):
    ok = delete_flashcard(card_id=card_id, user_id=current_user["id"])

    if not ok:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return {"deleted": True}