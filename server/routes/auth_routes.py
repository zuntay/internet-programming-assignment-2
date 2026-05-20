from pydantic import BaseModel, EmailStr, Field
from fastapi import APIRouter, HTTPException, Depends

from server.auth import get_current_user
from server.controllers.auth_controller import (
    get_user_by_username,
    get_user_by_email,
    create_user,
    authenticate_user,
    make_login_response,
    public_user,
)


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(data: RegisterRequest):
    username = data.username.strip()
    email = data.email.strip().lower()

    if get_user_by_username(username):
        raise HTTPException(status_code=400, detail="Username already exists")

    if get_user_by_email(email):
        raise HTTPException(status_code=400, detail="Email already exists")

    user = create_user(username=username, email=email, password=data.password)
    return make_login_response(user)


@router.post("/login")
def login(data: LoginRequest):
    user = authenticate_user(data.username.strip(), data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return make_login_response(user)


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return public_user(current_user)