from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from server.auth import get_current_user, require_admin
from server.controllers.history_controller import (
    create_history,
    list_my_history,
    list_all_history,
    delete_history,
)


router = APIRouter(prefix="/api/history", tags=["Learning History"])


class HistoryRequest(BaseModel):
    flashcardId: int
    userAnswer: str = Field(default="")
    isCorrect: bool = False


@router.post("")
def http_create_history(
    data: HistoryRequest,
    current_user: dict = Depends(get_current_user),
):
    history = create_history(
        user_id=current_user["id"],
        flashcard_id=data.flashcardId,
        user_answer=data.userAnswer,
        is_correct=data.isCorrect,
    )

    if not history:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return history


@router.get("/me")
def http_list_my_history(current_user: dict = Depends(get_current_user)):
    return list_my_history(user_id=current_user["id"])


@router.get("/all")
def http_list_all_history(admin_user: dict = Depends(require_admin)):
    return list_all_history()


@router.delete("/{history_id}")
def http_delete_history(
    history_id: int,
    current_user: dict = Depends(get_current_user),
):
    is_admin = current_user.get("role") == "admin"

    ok = delete_history(
        history_id=history_id,
        user_id=current_user["id"],
        is_admin=is_admin,
    )

    if not ok:
        raise HTTPException(status_code=404, detail="History record not found")

    return {"deleted": True}