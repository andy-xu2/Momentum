from __future__ import annotations

import json
from pathlib import Path

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

USERS_FILE = Path(__file__).parent.parent / "users.json"


def _load() -> dict:
    if not USERS_FILE.exists():
        return {}
    try:
        return json.loads(USERS_FILE.read_text())
    except Exception:
        return {}


def _save(users: dict) -> None:
    USERS_FILE.write_text(json.dumps(users, indent=2))


def register_user(email: str, password: str, name: str) -> dict:
    users = _load()
    key = email.lower().strip()
    if key in users:
        raise ValueError("An account with that email already exists.")
    users[key] = {
        "email": key,
        "name": name,
        "hashed_password": pwd_context.hash(password),
    }
    _save(users)
    return {"email": key, "name": name}


def login_user(email: str, password: str) -> dict:
    users = _load()
    key = email.lower().strip()
    user = users.get(key)
    if not user or not pwd_context.verify(password, user["hashed_password"]):
        raise ValueError("Invalid email or password.")
    return {"email": user["email"], "name": user["name"]}
