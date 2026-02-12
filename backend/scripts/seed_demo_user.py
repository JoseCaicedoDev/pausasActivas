import argparse
import sys
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Sequence

from sqlalchemy import delete, select

# Allow running as: python scripts/seed_demo_user.py
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import BreakSession, DailyRecord, User, UserSettings


@dataclass(frozen=True)
class DaySeed:
    completed: int
    started: int
    expected: int


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create or update a demo user and seed realistic history data."
    )
    parser.add_argument("--email", required=True, help="Demo user email")
    parser.add_argument("--password", required=True, help="Demo user password")
    parser.add_argument("--days", type=int, default=30, help="Number of days to seed (default: 30)")
    parser.add_argument(
        "--reset-existing",
        action="store_true",
        help="Delete existing history for this user before seeding",
    )
    parser.add_argument(
        "--expected",
        type=int,
        default=4,
        help="Expected sessions per day used for generated records (default: 4)",
    )
    return parser.parse_args()


def _clamp(value: int, min_value: int, max_value: int) -> int:
    return max(min_value, min(max_value, value))


def _compute_day_seed(day_index: int, expected: int) -> DaySeed:
    # Mixed realistic pattern: high (100/75), medium (50), low (25/0)
    pattern = (100, 75, 50, 25, 0, 75, 50)
    pct = pattern[day_index % len(pattern)]

    completed = round((pct / 100) * expected) if expected > 0 else 0
    completed = _clamp(completed, 0, expected)

    # Keep started >= completed, with slight variability and occasional no-shows.
    extra_attempt = 1 if (day_index % 3 == 0 and completed < expected) else 0
    started = completed + extra_attempt
    started = _clamp(started, completed, expected)
    if pct == 0:
        started = 0 if day_index % 2 == 0 else _clamp(1, 0, expected)

    return DaySeed(completed=completed, started=started, expected=expected)


def _build_started_at(day: date, position: int) -> datetime:
    # Sessions distributed during workday window.
    session_time = time(hour=9 + (position % 8), minute=(position * 7) % 60, tzinfo=timezone.utc)
    return datetime.combine(day, session_time)


def _ensure_user(db, email: str, password: str) -> User:
    normalized = email.lower().strip()
    user = db.scalar(select(User).where(User.email == normalized))
    if not user:
        user = User(email=normalized, password_hash=get_password_hash(password))
        db.add(user)
        db.flush()
    else:
        user.password_hash = get_password_hash(password)
    return user


def _ensure_settings(db, user_id) -> None:
    settings = db.get(UserSettings, user_id)
    if not settings:
        settings = UserSettings(
            user_id=user_id,
            work_interval_minutes=120,
            break_duration_minutes=10,
            alarm_volume=50,
            alarm_type="gentle",
            theme="dark",
            disclaimer_accepted=False,
            disclaimer_accepted_at=None,
            notifications_enabled=False,
            auto_start_next_cycle=True,
            work_start_hour=8,
            work_end_hour=18,
        )
        db.add(settings)


def _reset_history(db, user_id) -> None:
    db.execute(delete(BreakSession).where(BreakSession.user_id == user_id))
    db.execute(delete(DailyRecord).where(DailyRecord.user_id == user_id))


def _has_day_data(db, user_id, day: date) -> bool:
    has_session = db.scalar(
        select(BreakSession.id).where(BreakSession.user_id == user_id, BreakSession.date == day).limit(1)
    )
    has_record = db.scalar(
        select(DailyRecord.user_id).where(DailyRecord.user_id == user_id, DailyRecord.date == day).limit(1)
    )
    return bool(has_session or has_record)


def _seed_day(db, user_id, day: date, day_seed: DaySeed, day_index: int) -> None:
    exercise_pool: Sequence[str] = (
        "visual-20-20-20",
        "cuello-lateral",
        "hombros-rotacion",
        "manos-circulos",
        "espalda-gato",
    )

    for i in range(day_seed.started):
        started_at = _build_started_at(day, i)
        completed = i < day_seed.completed
        planned = 10 * 60
        actual = planned - ((day_index + i) % 90) if completed else 0
        completed_at = started_at + timedelta(seconds=max(actual, 0)) if completed else None

        db.add(
            BreakSession(
                user_id=user_id,
                date=day,
                started_at=started_at,
                completed=completed,
                completed_at=completed_at,
                exercise_ids=[exercise_pool[(day_index + i) % len(exercise_pool)]],
                duration_planned_seconds=planned,
                duration_actual_seconds=max(actual, 0),
            )
        )

    compliance = round((day_seed.completed / day_seed.expected) * 100) if day_seed.expected > 0 else 0
    db.add(
        DailyRecord(
            user_id=user_id,
            date=day,
            sessions_expected=day_seed.expected,
            sessions_started=day_seed.started,
            sessions_completed=day_seed.completed,
            compliance_percent=compliance,
        )
    )


def main() -> None:
    args = _parse_args()
    days = max(1, args.days)
    expected = max(0, args.expected)
    today = date.today()

    with SessionLocal() as db:
        user = _ensure_user(db, args.email, args.password)
        _ensure_settings(db, user.id)

        if args.reset_existing:
            _reset_history(db, user.id)

        seeded_days = 0
        skipped_days = 0
        for offset in range(days - 1, -1, -1):
            day = today - timedelta(days=offset)
            day_index = days - 1 - offset
            if not args.reset_existing and _has_day_data(db, user.id, day):
                skipped_days += 1
                continue
            _seed_day(db, user.id, day, _compute_day_seed(day_index, expected), day_index)
            seeded_days += 1

        db.commit()

        print("Demo seed completed")
        print(f"email={user.email}")
        print(f"days_seeded={seeded_days}")
        print(f"days_skipped_existing={skipped_days}")
        print(f"expected_per_day={expected}")
        print(f"reset_existing={args.reset_existing}")


if __name__ == "__main__":
    main()
