from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .auth import login_user, register_user  # noqa: E402
from .db import mongo  # noqa: E402
from .demo_data import get_demo_data  # noqa: E402
from .models import (  # noqa: E402
    AuthResponse,
    GenerateRequest,
    GenerateResponse,
    LoginRequest,
    RegisterRequest,
    RescheduleRequest,
    RescheduleResponse,
)
from .scheduler import generate_schedules, reschedule_missed  # noqa: E402

app = FastAPI(title="Momentum API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest) -> AuthResponse:
    try:
        user = register_user(payload.email, payload.password, payload.name)
        return AuthResponse(**user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    try:
        user = login_user(payload.email, payload.password)
        return AuthResponse(**user)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "mongo_enabled": mongo.enabled,
        "mongo_error": mongo.error,
    }


@app.get("/demo-data")
def demo_data() -> dict:
    return get_demo_data()


@app.post("/schedules/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest) -> GenerateResponse:
    options = generate_schedules(
        wake_time=payload.wake_time,
        sleep_time=payload.sleep_time,
        fixed_events=payload.fixed_events,
        flex_tasks=payload.flex_tasks,
        today_str=payload.today,
    )
    mongo.save_inputs(payload.model_dump())
    for option in options:
        mongo.save_schedule(option.model_dump())
    return GenerateResponse(options=options)


@app.post("/schedules/reschedule", response_model=RescheduleResponse)
def reschedule(payload: RescheduleRequest) -> RescheduleResponse:
    schedule, message = reschedule_missed(payload.schedule, payload.placement_id)
    mongo.save_schedule(schedule.model_dump())
    return RescheduleResponse(schedule=schedule, message=message)
