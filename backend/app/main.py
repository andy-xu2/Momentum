from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .db import mongo  # noqa: E402
from .demo_data import get_demo_data  # noqa: E402
from .models import (  # noqa: E402
    GenerateRequest,
    GenerateResponse,
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
