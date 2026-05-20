from server.db import get_connection
from server.auth import hash_password, verify_password, create_access_token


def public_user(user: dict):
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "createdAt": user["created_at"].isoformat() if user.get("created_at") else None,
        "updatedAt": user["updated_at"].isoformat() if user.get("updated_at") else None,
    }


def get_user_by_username(username: str):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id, username, email, hashed_password, role, created_at, updated_at
        FROM users
        WHERE username = %s;
        """,
        (username,),
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def get_user_by_email(email: str):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id, username, email, hashed_password, role, created_at, updated_at
        FROM users
        WHERE email = %s;
        """,
        (email,),
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user


def create_user(username: str, email: str, password: str, role: str = "user"):
    hashed = hash_password(password)

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        """
        INSERT INTO users (username, email, hashed_password, role)
        VALUES (%s, %s, %s, %s);
        """,
        (username, email, hashed, role),
    )
    conn.commit()
    new_id = cur.lastrowid

    cur.execute(
        """
        SELECT id, username, email, hashed_password, role, created_at, updated_at
        FROM users
        WHERE id = %s;
        """,
        (new_id,),
    )
    user = cur.fetchone()

    cur.close()
    conn.close()
    return user


def authenticate_user(username: str, password: str):
    user = get_user_by_username(username)

    if not user:
        return None

    if not verify_password(password, user["hashed_password"]):
        return None

    return user


def make_login_response(user: dict):
    token = create_access_token(
        {
            "sub": str(user["id"]),
            "username": user["username"],
            "role": user["role"],
        }
    )

    return {
        "accessToken": token,
        "tokenType": "bearer",
        "user": public_user(user),
    }