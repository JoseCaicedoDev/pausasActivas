from datetime import date, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models import BreakSession, DailyRecord, User
from app.schemas import (
    BreakSessionCompleteIn,
    BreakSessionCreateIn,
    BreakSessionOut,
    DailyRecordOut,
    ExpectedSessionsIn,
)

router = APIRouter(prefix="/history", tags=["history"])


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _session_to_out(session: BreakSession) -> BreakSessionOut:
    return BreakSessionOut(
        id=str(session.id),
        date=session.date.isoformat(),
        startedAt=session.started_at.isoformat(),
        completedAt=session.completed_at.isoformat() if session.completed_at else None,
        completed=session.completed,
        exerciseIds=session.exercise_ids,
        durationPlannedSeconds=session.duration_planned_seconds,
        durationActualSeconds=session.duration_actual_seconds,
    )


def _daily_to_out(record: DailyRecord) -> DailyRecordOut:
    return DailyRecordOut(
        date=record.date.isoformat(),
        sessionsExpected=record.sessions_expected,
        sessionsStarted=record.sessions_started,
        sessionsCompleted=record.sessions_completed,
        compliancePercent=record.compliance_percent,
    )


def recompute_daily_record(db: Session, user_id: UUID, day: date) -> None:
    sessions = db.scalars(
        select(BreakSession).where(BreakSession.user_id == user_id, BreakSession.date == day)
    ).all()
    started = len(sessions)
    completed = len([s for s in sessions if s.completed])

    record = db.get(DailyRecord, {"user_id": user_id, "date": day})
    if not record:
        record = DailyRecord(
            user_id=user_id,
            date=day,
            sessions_expected=4,
        )
        db.add(record)
    expected = max(0, record.sessions_expected)
    record.sessions_started = started
    record.sessions_completed = completed
    record.compliance_percent = round((completed / expected) * 100) if expected > 0 else 0
    db.commit()


@router.get("/sessions", response_model=list[BreakSessionOut])
def get_sessions(
    from_: str = Query(alias="from"),
    to: str = Query(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[BreakSessionOut]:
    start = date.fromisoformat(from_)
    end = date.fromisoformat(to)
    sessions = db.scalars(
        select(BreakSession)
        .where(BreakSession.user_id == current_user.id, BreakSession.date >= start, BreakSession.date <= end)
        .order_by(BreakSession.started_at.asc())
    ).all()
    return [_session_to_out(item) for item in sessions]


@router.post("/sessions", response_model=BreakSessionOut)
def create_break_session(
    payload: BreakSessionCreateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BreakSessionOut:
    session = BreakSession(
        user_id=current_user.id,
        date=date.fromisoformat(payload.date),
        started_at=_parse_iso(payload.startedAt),
        completed=False,
        completed_at=None,
        exercise_ids=payload.exerciseIds,
        duration_planned_seconds=payload.durationPlannedSeconds,
        duration_actual_seconds=0,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    recompute_daily_record(db, current_user.id, session.date)
    return _session_to_out(session)


@router.patch("/sessions/{session_id}/complete", response_model=BreakSessionOut)
def complete_break_session(
    session_id: str,
    payload: BreakSessionCompleteIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BreakSessionOut:
    session = db.get(BreakSession, UUID(session_id))
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sesion no encontrada")

    session.completed = True
    session.completed_at = _parse_iso(payload.completedAt)
    session.duration_actual_seconds = payload.durationActualSeconds
    db.commit()
    db.refresh(session)
    recompute_daily_record(db, current_user.id, session.date)
    return _session_to_out(session)


@router.get("/daily-records", response_model=list[DailyRecordOut])
def get_daily_records(
    from_: str = Query(alias="from"),
    to: str = Query(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DailyRecordOut]:
    start = date.fromisoformat(from_)
    end = date.fromisoformat(to)
    records = db.scalars(
        select(DailyRecord)
        .where(DailyRecord.user_id == current_user.id, DailyRecord.date >= start, DailyRecord.date <= end)
        .order_by(DailyRecord.date.asc())
    ).all()
    return [_daily_to_out(item) for item in records]


@router.put("/daily-records/{record_date}/expected", response_model=DailyRecordOut)
def update_expected_sessions(
    record_date: str,
    payload: ExpectedSessionsIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyRecordOut:
    day = date.fromisoformat(record_date)
    record = db.get(DailyRecord, {"user_id": current_user.id, "date": day})
    if not record:
        record = DailyRecord(
            user_id=current_user.id,
            date=day,
            sessions_expected=payload.sessionsExpected,
            sessions_started=0,
            sessions_completed=0,
            compliance_percent=0,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return _daily_to_out(record)

    record.sessions_expected = payload.sessionsExpected
    expected = max(0, record.sessions_expected)
    record.compliance_percent = round((record.sessions_completed / expected) * 100) if expected > 0 else 0
    db.commit()
    db.refresh(record)
    return _daily_to_out(record)
