from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field

Energy = Literal["Low", "Medium", "High"]
Status = Literal["upcoming", "done", "missed"]
BurnoutColor = Literal["Green", "Yellow", "Red"]
Day = Literal[
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


class FixedEvent(BaseModel):
    id: str
    name: str
    days: list[Day]
    start: str  # "HH:MM"
    end: str   # "HH:MM"


class FlexTask(BaseModel):
    id: str
    name: str
    duration: int  # minutes
    energy: Energy
    priority: int = Field(ge=1, le=5)
    # Deadline is now an ISO calendar date (YYYY-MM-DD) or None for no deadline.
    deadline: Optional[str] = None
    occurrences: int = Field(ge=1, le=14, default=1)


class GenerateRequest(BaseModel):
    wake_time: str
    sleep_time: str
    fixed_events: list[FixedEvent]
    flex_tasks: list[FlexTask]
    # Optional ISO date the client treats as "today". The server falls back
    # to its own clock if not provided.
    today: Optional[str] = None


class PriorSlot(BaseModel):
    day: Day
    start: str


class Placement(BaseModel):
    id: str
    source_id: str
    name: str
    day: Day
    start: str
    end: str
    duration: int
    energy: Energy
    priority: int
    status: Status = "upcoming"
    kind: Literal["fixed", "flex"]
    # Optional warning for placements that violated a deadline constraint.
    warning: Optional[str] = None
    # Slots this placement has previously occupied. Used by reschedule so a
    # task never bounces back to a slot it has already been moved out of.
    prior_slots: list[PriorSlot] = []


class Schedule(BaseModel):
    id: str
    label: Literal["Balanced", "Intensive", "Light"]
    burnout_score: int
    burnout_color: BurnoutColor
    wake_time: str
    sleep_time: str
    placements: list[Placement]
    warnings: list[str] = []


class GenerateResponse(BaseModel):
    options: list[Schedule]


class RescheduleRequest(BaseModel):
    schedule: Schedule
    placement_id: str


class RescheduleResponse(BaseModel):
    schedule: Schedule
    message: str
