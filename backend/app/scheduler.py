"""Scheduling engine for Momentum.

Key behaviors:

* Build free slots from start-of-day to end-of-day, minus fixed events.
  A 10 minute gap is left around every fixed and flex item.
* Expand recurring flex tasks into N independent instances.
* Pick a target day for each instance using deadline aware spacing, then
  fall back to load aware day selection.
* Within a chosen day, score candidate start times so tasks are spread
  through morning, afternoon, and evening rather than always landing
  right after the previous event.
* Compute a 0 to 100 burnout score with penalties for back-to-back high
  energy, long daily totals, and crowded days.
* Reschedule: a missed task moves to a brand new slot and remembers
  every slot it has ever held, so repeated missed clicks keep moving it
  forward instead of bouncing back.
"""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Optional
from uuid import uuid4

from .models import (
    BurnoutColor,
    FixedEvent,
    FlexTask,
    Placement,
    PriorSlot,
    Schedule,
)

DAYS: list[str] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]
DAY_INDEX = {day: idx for idx, day in enumerate(DAYS)}
ENERGY_WEIGHT = {"Low": 1, "Medium": 2, "High": 3}

GAP_MINUTES = 10
# Minimum cushion we *prefer* between flex tasks. The 10 minute gap is
# enforced; anything below this preferred cushion gets penalized.
PREFERRED_GAP = 30
CANDIDATE_STEP = 15

# Time-of-day buckets so a single day naturally rotates morning,
# afternoon, evening, late instead of stacking.
TIME_BUCKETS = [
    ("morning", 6 * 60, 12 * 60),
    ("afternoon", 12 * 60, 17 * 60),
    ("evening", 17 * 60, 21 * 60),
    ("late", 21 * 60, 24 * 60),
]

VARIANTS = {
    "Balanced": {
        "daily_cap_minutes": 6 * 60,
        "max_tasks_per_day": 5,
        "front_bias": 0.0,
    },
    "Intensive": {
        "daily_cap_minutes": 8 * 60,
        "max_tasks_per_day": 7,
        "front_bias": -0.25,
    },
    "Light": {
        "daily_cap_minutes": 4 * 60,
        "max_tasks_per_day": 3,
        "front_bias": 0.0,
    },
}


@dataclass
class Slot:
    day: str
    start: int
    end: int

    @property
    def length(self) -> int:
        return self.end - self.start


@dataclass
class DayState:
    slots: list[Slot] = field(default_factory=list)
    placements: list[Placement] = field(default_factory=list)
    load: int = 0
    scheduled_sources: set[str] = field(default_factory=set)


def hhmm_to_min(value: str) -> int:
    h, m = value.split(":")
    return int(h) * 60 + int(m)


def min_to_hhmm(value: int) -> str:
    h = value // 60
    m = value % 60
    return f"{h:02d}:{m:02d}"


def to_12hr(hhmm: str) -> str:
    h, m = hhmm.split(":")
    h_i = int(h)
    period = "AM" if h_i < 12 else "PM"
    display = 12 if h_i == 0 else (h_i - 12 if h_i > 12 else h_i)
    return f"{display}:{int(m):02d} {period}"


def parse_today(today_str: Optional[str]) -> date:
    if today_str:
        try:
            return date.fromisoformat(today_str)
        except ValueError:
            pass
    return date.today()


def week_monday(reference: date) -> date:
    return reference - timedelta(days=reference.weekday())


def deadline_index_in_week(
    deadline_str: Optional[str],
    today: date,
) -> Optional[int]:
    if not deadline_str:
        return None
    try:
        deadline = date.fromisoformat(deadline_str)
    except ValueError:
        return None
    monday = week_monday(today)
    sunday = monday + timedelta(days=6)
    if deadline < today:
        return today.weekday()
    if deadline > sunday:
        return None
    return deadline.weekday()


def fixed_to_placements(events: list[FixedEvent]) -> list[Placement]:
    placements: list[Placement] = []
    for event in events:
        for day in event.days:
            start_min = hhmm_to_min(event.start)
            end_min = hhmm_to_min(event.end)
            placements.append(
                Placement(
                    id=str(uuid4()),
                    source_id=event.id,
                    name=event.name,
                    day=day,
                    start=event.start,
                    end=event.end,
                    duration=max(0, end_min - start_min),
                    energy="Low",
                    priority=5,
                    status="upcoming",
                    kind="fixed",
                )
            )
    return placements


def build_initial_slots(
    wake_min: int,
    sleep_min: int,
    fixed: list[Placement],
    gap: int = GAP_MINUTES,
) -> dict[str, list[Slot]]:
    by_day: dict[str, list[Slot]] = {day: [] for day in DAYS}
    for day in DAYS:
        day_fixed = sorted(
            [p for p in fixed if p.day == day],
            key=lambda p: hhmm_to_min(p.start),
        )
        cursor = wake_min
        for event in day_fixed:
            event_start = hhmm_to_min(event.start)
            event_end = hhmm_to_min(event.end)
            slot_end = event_start - gap
            if slot_end > cursor:
                by_day[day].append(Slot(day=day, start=cursor, end=slot_end))
            cursor = max(cursor, event_end + gap)
        if cursor < sleep_min:
            by_day[day].append(Slot(day=day, start=cursor, end=sleep_min))
    return by_day


def carve_slot(
    slots: list[Slot],
    slot: Slot,
    start: int,
    end: int,
) -> list[Slot]:
    new_slots: list[Slot] = []
    for s in slots:
        if s is slot:
            if s.start < start:
                new_slots.append(Slot(day=s.day, start=s.start, end=start))
            if end < s.end:
                new_slots.append(Slot(day=s.day, start=end, end=s.end))
        else:
            new_slots.append(s)
    return new_slots


def expand_flex(
    tasks: list[FlexTask],
    today: date,
    variant_name: str,
) -> list[dict]:
    cfg = VARIANTS[variant_name]
    front_bias = cfg["front_bias"]
    today_idx = today.weekday()
    expanded: list[dict] = []

    for task in tasks:
        deadline_idx = deadline_index_in_week(task.deadline, today)
        end_idx = deadline_idx if deadline_idx is not None else 6
        if end_idx < today_idx:
            end_idx = today_idx
        eligible = list(range(today_idx, end_idx + 1))
        if not eligible:
            eligible = [today_idx]

        n = task.occurrences
        targets: list[int] = []
        if n == 1:
            mid = eligible[len(eligible) // 2]
            targets.append(mid)
        else:
            window = len(eligible) - 1 if len(eligible) > 1 else 0
            for i in range(n):
                if window == 0:
                    targets.append(eligible[0])
                    continue
                ratio = i / (n - 1)
                shifted = max(0.0, min(1.0, ratio + front_bias))
                idx = eligible[round(shifted * window)]
                targets.append(idx)

        for i in range(n):
            expanded.append(
                {
                    "id": f"{task.id}__{i}",
                    "source_id": task.id,
                    "name": task.name,
                    "duration": task.duration,
                    "energy": task.energy,
                    "priority": task.priority,
                    "deadline": task.deadline,
                    "deadline_idx": deadline_idx,
                    "eligible_days": [DAYS[d] for d in eligible],
                    "target_day": DAYS[targets[i]],
                    "instance_index": i,
                }
            )
    return expanded


def sort_instances(instances: list[dict]) -> list[dict]:
    def key(t: dict):
        deadline_rank = (
            t["deadline_idx"] if t["deadline_idx"] is not None else 99
        )
        return (
            deadline_rank,
            -t["priority"],
            -ENERGY_WEIGHT[t["energy"]],
        )

    return sorted(instances, key=key)


def days_ordered_for_placement(
    instance: dict,
    day_states: dict[str, DayState],
    variant_name: str,
) -> list[str]:
    eligible = instance["eligible_days"]
    target = instance["target_day"]

    def base(day: str) -> tuple:
        state = day_states[day]
        already_has = 1 if instance["source_id"] in state.scheduled_sources else 0
        flex_count = sum(1 for p in state.placements if p.kind == "flex")
        return already_has, flex_count, state.load

    if variant_name == "Intensive":
        def key(day: str) -> tuple:
            already_has, flex_count, load = base(day)
            return (already_has, DAY_INDEX[day], flex_count, load)

        return sorted(eligible, key=key)

    if variant_name == "Light":
        def key(day: str) -> tuple:
            already_has, flex_count, load = base(day)
            return (already_has, abs(DAY_INDEX[day] - DAY_INDEX[target]), flex_count, load)

        return sorted(eligible, key=key)

    def key(day: str) -> tuple:
        already_has, flex_count, load = base(day)
        return (already_has, flex_count, load, abs(DAY_INDEX[day] - DAY_INDEX[target]))

    return sorted(eligible, key=key)


def bucket_for(start_min: int) -> str:
    for name, lo, hi in TIME_BUCKETS:
        if lo <= start_min < hi:
            return name
    return "late"


def candidate_starts(slot: Slot, duration: int) -> list[int]:
    """Generate a handful of candidate start times across a slot. We prefer
    snapped boundaries (top of the hour and half hours) and never start
    earlier than the slot start."""
    starts: list[int] = []
    # Walk in CANDIDATE_STEP increments.
    pos = slot.start
    while pos + duration <= slot.end:
        starts.append(pos)
        pos += CANDIDATE_STEP
    # Always include slot.start so we never miss a tight slot.
    if not starts:
        if slot.length >= duration:
            starts.append(slot.start)
    return starts


def score_candidate(
    start_min: int,
    duration: int,
    slot: Slot,
    state: DayState,
    instance: dict,
    forbidden_starts: set[tuple[str, int]],
) -> Optional[float]:
    """Score a candidate start time. Higher is better. Returns None if the
    start is invalid (forbidden or outside the slot)."""
    end_min = start_min + duration
    if end_min > slot.end:
        return None
    if (slot.day, start_min) in forbidden_starts:
        return None

    score = 100.0

    # Penalty for sitting flush against another event. Reward breathing
    # room up to PREFERRED_GAP minutes on each side.
    flex_neighbors = sorted(
        (p for p in state.placements if p.kind == "flex"),
        key=lambda p: hhmm_to_min(p.start),
    )
    fixed_neighbors = [p for p in state.placements if p.kind == "fixed"]

    nearest_before_end: Optional[int] = None
    nearest_after_start: Optional[int] = None
    for p in [*flex_neighbors, *fixed_neighbors]:
        p_start = hhmm_to_min(p.start)
        p_end = hhmm_to_min(p.end)
        if p_end <= start_min:
            if nearest_before_end is None or p_end > nearest_before_end:
                nearest_before_end = p_end
        elif p_start >= end_min:
            if nearest_after_start is None or p_start < nearest_after_start:
                nearest_after_start = p_start
        else:
            return None

    gap_before = (
        start_min - nearest_before_end
        if nearest_before_end is not None
        else (start_min - slot.start)
    )
    gap_after = (
        nearest_after_start - end_min
        if nearest_after_start is not None
        else (slot.end - end_min)
    )

    if gap_before < PREFERRED_GAP:
        score -= (PREFERRED_GAP - gap_before) * 1.5
    if gap_after < PREFERRED_GAP:
        score -= (PREFERRED_GAP - gap_after) * 1.0

    # Penalize starting at the very beginning of the slot when we could
    # offset further. This is the main fix for "always right after a
    # fixed event".
    if start_min == slot.start and slot.length >= duration + PREFERRED_GAP:
        score -= 25

    # Time-of-day diversity: prefer buckets the day hasn't used yet.
    used_buckets: dict[str, int] = {}
    for p in state.placements:
        if p.kind != "flex":
            continue
        b = bucket_for(hhmm_to_min(p.start))
        used_buckets[b] = used_buckets.get(b, 0) + 1
    my_bucket = bucket_for(start_min)
    score -= used_buckets.get(my_bucket, 0) * 35

    # Energy aware shaping: high energy work prefers morning/afternoon,
    # low energy work prefers afternoon/evening.
    if instance["energy"] == "High":
        if my_bucket == "morning":
            score += 10
        elif my_bucket == "late":
            score -= 30
    elif instance["energy"] == "Low":
        if my_bucket in ("evening", "afternoon"):
            score += 5
        if my_bucket == "morning":
            score -= 5

    # Avoid back-to-back high-energy chains except for Intensive (caller
    # decides) by penalizing being adjacent to a recent high-energy item.
    if instance["energy"] == "High":
        for p in flex_neighbors:
            if p.energy != "High":
                continue
            p_end = hhmm_to_min(p.end)
            p_start = hhmm_to_min(p.start)
            if abs(start_min - p_end) < 60 or abs(end_min - p_start) < 60:
                score -= 40

    return score


def place_instance(
    instance: dict,
    day_states: dict[str, DayState],
    variant_name: str,
    forbidden_starts: Optional[set[tuple[str, int]]] = None,
) -> Optional[Placement]:
    cfg = VARIANTS[variant_name]
    daily_cap = cfg["daily_cap_minutes"]
    max_tasks = cfg["max_tasks_per_day"]
    forbidden_starts = forbidden_starts or set()

    for day in days_ordered_for_placement(instance, day_states, variant_name):
        state = day_states[day]
        if state.load + instance["duration"] > daily_cap:
            continue
        flex_count = sum(1 for p in state.placements if p.kind == "flex")
        if flex_count >= max_tasks:
            continue

        best: Optional[tuple[float, Slot, int]] = None
        for slot in state.slots:
            if slot.length < instance["duration"]:
                continue
            for start in candidate_starts(slot, instance["duration"]):
                score = score_candidate(
                    start, instance["duration"], slot, state, instance, forbidden_starts
                )
                if score is None:
                    continue
                if variant_name != "Intensive" and instance["energy"] == "High":
                    has_high_neighbor = any(
                        p.kind == "flex"
                        and p.energy == "High"
                        and abs(start - hhmm_to_min(p.end)) < 30
                        for p in state.placements
                    )
                    if has_high_neighbor:
                        continue
                if best is None or score > best[0]:
                    best = (score, slot, start)

        if best is None:
            continue

        _, slot, start_min = best
        end_min = start_min + instance["duration"]
        placement = Placement(
            id=str(uuid4()),
            source_id=instance["source_id"],
            name=instance["name"],
            day=day,
            start=min_to_hhmm(start_min),
            end=min_to_hhmm(end_min),
            duration=instance["duration"],
            energy=instance["energy"],
            priority=instance["priority"],
            status="upcoming",
            kind="flex",
        )
        # Carve [start - GAP, end + GAP] out of the slot so neighbors
        # always have at least the minimum 10 minute gap.
        carve_start = max(slot.start, start_min - GAP_MINUTES)
        carve_end = min(slot.end, end_min + GAP_MINUTES)
        state.slots = carve_slot(state.slots, slot, carve_start, carve_end)
        state.placements.append(placement)
        state.load += instance["duration"]
        state.scheduled_sources.add(instance["source_id"])
        return placement

    return None


def best_effort_place(
    instance: dict,
    day_states: dict[str, DayState],
    today_idx: int = 0,
) -> Optional[Placement]:
    candidates = [d for d in DAYS if DAY_INDEX[d] >= today_idx] or list(DAYS)
    candidates.sort(key=lambda d: day_states[d].load)
    for day in candidates:
        state = day_states[day]
        for slot in state.slots:
            if slot.length < instance["duration"]:
                continue
            start_min = slot.start
            end_min = start_min + instance["duration"]
            warning = (
                f"{instance['name']} could not fit before its deadline; "
                f"placed on {day} as best effort."
            )
            placement = Placement(
                id=str(uuid4()),
                source_id=instance["source_id"],
                name=instance["name"],
                day=day,
                start=min_to_hhmm(start_min),
                end=min_to_hhmm(end_min),
                duration=instance["duration"],
                energy=instance["energy"],
                priority=instance["priority"],
                status="upcoming",
                kind="flex",
                warning=warning,
            )
            carve_end = min(slot.end, end_min + GAP_MINUTES)
            state.slots = carve_slot(state.slots, slot, start_min, carve_end)
            state.placements.append(placement)
            state.load += instance["duration"]
            state.scheduled_sources.add(instance["source_id"])
            return placement
    return None


def compute_burnout(placements: list[Placement]) -> tuple[int, BurnoutColor]:
    score = 0.0
    by_day: dict[str, list[Placement]] = {day: [] for day in DAYS}
    for p in placements:
        if p.kind != "flex":
            continue
        score += (p.duration * ENERGY_WEIGHT[p.energy]) / 75.0
        by_day[p.day].append(p)

    for items in by_day.values():
        items.sort(key=lambda p: p.start)
        for i in range(1, len(items)):
            if items[i].energy == "High" and items[i - 1].energy == "High":
                score += 8
        daily_total = sum(p.duration for p in items)
        if daily_total > 5 * 60:
            score += (daily_total - 300) / 30.0
        if len(items) >= 5:
            score += (len(items) - 4) * 4

    score_int = max(0, min(100, round(score)))
    if score_int < 40:
        color: BurnoutColor = "Green"
    elif score_int < 70:
        color = "Yellow"
    else:
        color = "Red"
    return score_int, color


def build_schedule(
    label: str,
    wake_min: int,
    sleep_min: int,
    fixed_placements: list[Placement],
    flex_tasks: list[FlexTask],
    today: date,
) -> Schedule:
    fresh_slots = build_initial_slots(wake_min, sleep_min, fixed_placements)
    day_states: dict[str, DayState] = {
        day: DayState(slots=fresh_slots[day]) for day in DAYS
    }
    for fp in fixed_placements:
        day_states[fp.day].placements.append(fp)

    instances = sort_instances(expand_flex(flex_tasks, today, label))
    warnings: list[str] = []
    today_idx = today.weekday()
    for inst in instances:
        placed = place_instance(inst, day_states, label)
        if placed is None:
            placed = best_effort_place(inst, day_states, today_idx=today_idx)
            if placed and placed.warning:
                warnings.append(placed.warning)
        if placed is None:
            warnings.append(
                f"{inst['name']} could not be scheduled this week."
            )

    flex_placements = [
        p for state in day_states.values()
        for p in state.placements
        if p.kind == "flex"
    ]
    all_placements = fixed_placements + flex_placements
    score, color = compute_burnout(all_placements)
    return Schedule(
        id=str(uuid4()),
        label=label,  # type: ignore[arg-type]
        burnout_score=score,
        burnout_color=color,
        wake_time=min_to_hhmm(wake_min),
        sleep_time=min_to_hhmm(sleep_min),
        placements=all_placements,
        warnings=warnings,
    )


def generate_schedules(
    wake_time: str,
    sleep_time: str,
    fixed_events: list[FixedEvent],
    flex_tasks: list[FlexTask],
    today_str: Optional[str] = None,
) -> list[Schedule]:
    today = parse_today(today_str)
    wake_min = hhmm_to_min(wake_time)
    sleep_min = hhmm_to_min(sleep_time)

    fixed_placements = fixed_to_placements(fixed_events)

    options: list[Schedule] = []
    for label in ("Balanced", "Intensive", "Light"):
        options.append(
            build_schedule(
                label=label,
                wake_min=wake_min,
                sleep_min=sleep_min,
                fixed_placements=deepcopy(fixed_placements),
                flex_tasks=deepcopy(flex_tasks),
                today=today,
            )
        )
    return options


def reschedule_missed(
    schedule: Schedule, placement_id: str
) -> tuple[Schedule, str]:
    target = next(
        (p for p in schedule.placements if p.id == placement_id and p.kind == "flex"),
        None,
    )
    if target is None:
        return schedule, "Task not found."

    # Record current slot in history before we move. A missed-twice click
    # should keep moving forward, not bounce back to where it just was.
    current_slot = PriorSlot(day=target.day, start=target.start)
    if not any(
        ps.day == current_slot.day and ps.start == current_slot.start
        for ps in target.prior_slots
    ):
        target.prior_slots = [*target.prior_slots, current_slot]

    target.status = "missed"

    forbidden_starts: set[tuple[str, int]] = set()
    for ps in target.prior_slots:
        forbidden_starts.add((ps.day, hhmm_to_min(ps.start)))

    wake_min = hhmm_to_min(schedule.wake_time)
    sleep_min = hhmm_to_min(schedule.sleep_time)

    occupied = [p for p in schedule.placements if p.id != target.id]
    by_day = build_initial_slots(wake_min, sleep_min, occupied)

    # Reconstruct day_states so the candidate scorer can see neighbors.
    day_states: dict[str, DayState] = {day: DayState(slots=by_day[day]) for day in DAYS}
    for p in occupied:
        day_states[p.day].placements.append(p)
        if p.kind == "flex":
            day_states[p.day].load += p.duration
            day_states[p.day].scheduled_sources.add(p.source_id)

    missed_min = hhmm_to_min(target.start)
    missed_day = target.day

    # Walk same day first (starting right after the missed slot ends), then
    # subsequent days in calendar order. Pick the earliest slot that fits —
    # no scoring, no day-jump bonuses.
    missed_idx = DAY_INDEX[missed_day]
    walk_order = DAYS[missed_idx:] + DAYS[:missed_idx]

    STEP = 30  # 30-minute increments

    for day in walk_order:
        # On the missed day only consider time after the task would have ended.
        min_start = missed_min + target.duration if day == missed_day else wake_min

        for slot in by_day[day]:
            if slot.length < target.duration:
                continue
            # Round up to the next 30-min boundary at or after min_start.
            raw = max(slot.start, min_start)
            candidate = raw if raw % STEP == 0 else (raw // STEP + 1) * STEP
            while candidate + target.duration <= slot.end:
                if (day, candidate) not in forbidden_starts:
                    target.day = day  # type: ignore[assignment]
                    target.start = min_to_hhmm(candidate)
                    target.end = min_to_hhmm(candidate + target.duration)
                    target.status = "upcoming"
                    return (
                        schedule,
                        f"{target.name} moved to {day} at {to_12hr(target.start)}.",
                    )
                candidate += STEP

    return schedule, f"No open slot found for {target.name} this week."
