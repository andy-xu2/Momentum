"""Realistic college student demo data so judges can skip manual input."""

from datetime import date, timedelta

from .models import FixedEvent, FlexTask


def _week_monday() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


def _date_in_days(days: int) -> str:
    return (_week_monday() + timedelta(days=days)).isoformat()


def get_demo_data() -> dict:
    fixed_events = [
        FixedEvent(
            id="fe-calc",
            name="Calc 2 Lecture",
            days=["Monday", "Wednesday", "Friday"],
            start="10:00",
            end="11:00",
        ),
        FixedEvent(
            id="fe-eng",
            name="English 201",
            days=["Tuesday", "Thursday"],
            start="11:30",
            end="12:45",
        ),
        FixedEvent(
            id="fe-cs",
            name="Intro to CS",
            days=["Monday", "Wednesday"],
            start="13:00",
            end="14:30",
        ),
        FixedEvent(
            id="fe-job",
            name="Campus Job",
            days=["Tuesday", "Thursday"],
            start="15:00",
            end="18:00",
        ),
        FixedEvent(
            id="fe-club",
            name="CS Club Meeting",
            days=["Wednesday"],
            start="18:30",
            end="19:30",
        ),
        FixedEvent(
            id="fe-church",
            name="Sunday Service",
            days=["Sunday"],
            start="11:00",
            end="12:30",
        ),
    ]

    flex_tasks = [
        FlexTask(
            id="ft-calc-study",
            name="Calc Exam Prep",
            duration=90,
            energy="High",
            priority=5,
            deadline=_date_in_days(4),
            occurrences=3,
        ),
        FlexTask(
            id="ft-cs-project",
            name="CS Project Coding",
            duration=75,
            energy="High",
            priority=4,
            deadline=_date_in_days(6),
            occurrences=3,
        ),
        FlexTask(
            id="ft-essay",
            name="English Essay Draft",
            duration=60,
            energy="Medium",
            priority=4,
            deadline=_date_in_days(3),
            occurrences=2,
        ),
        FlexTask(
            id="ft-gym",
            name="Gym",
            duration=60,
            energy="Medium",
            priority=3,
            deadline=None,
            occurrences=3,
        ),
        FlexTask(
            id="ft-reading",
            name="Reading Assignment",
            duration=45,
            energy="Low",
            priority=3,
            deadline=None,
            occurrences=2,
        ),
        FlexTask(
            id="ft-call-home",
            name="Call Home",
            duration=30,
            energy="Low",
            priority=2,
            deadline=None,
            occurrences=1,
        ),
        FlexTask(
            id="ft-laundry",
            name="Laundry",
            duration=45,
            energy="Low",
            priority=2,
            deadline=None,
            occurrences=1,
        ),
    ]

    return {
        "wake_time": "07:30",
        "sleep_time": "23:30",
        "fixed_events": [e.model_dump() for e in fixed_events],
        "flex_tasks": [t.model_dump() for t in flex_tasks],
        # Anchor demo to the current week's Monday so judges always see a
        # nicely distributed schedule no matter when they run the demo.
        "today": _week_monday().isoformat(),
    }
