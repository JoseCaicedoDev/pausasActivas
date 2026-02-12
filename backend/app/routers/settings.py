from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_user
from app.models import User, UserSettings
from app.schemas import SettingsIn, SettingsOut

router = APIRouter(prefix="/settings", tags=["settings"])


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _to_schema(model: UserSettings) -> SettingsOut:
    return SettingsOut(
        workIntervalMinutes=model.work_interval_minutes,
        breakDurationMinutes=model.break_duration_minutes,
        alarmVolume=model.alarm_volume / 100,
        alarmType=model.alarm_type,
        theme=model.theme,
        disclaimerAccepted=model.disclaimer_accepted,
        disclaimerAcceptedAt=model.disclaimer_accepted_at.isoformat() if model.disclaimer_accepted_at else None,
        notificationsEnabled=model.notifications_enabled,
        autoStartNextCycle=model.auto_start_next_cycle,
        workStartHour=model.work_start_hour,
        workEndHour=model.work_end_hour,
    )


@router.get("/me", response_model=SettingsOut)
def get_my_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> SettingsOut:
    user_settings = db.get(UserSettings, current_user.id)
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
        db.commit()
        db.refresh(user_settings)
    return _to_schema(user_settings)


@router.put("/me", response_model=SettingsOut)
def update_my_settings(
    payload: SettingsIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SettingsOut:
    user_settings = db.get(UserSettings, current_user.id)
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)

    user_settings.work_interval_minutes = payload.workIntervalMinutes
    user_settings.break_duration_minutes = payload.breakDurationMinutes
    user_settings.alarm_volume = int(max(0, min(1, payload.alarmVolume)) * 100)
    user_settings.alarm_type = payload.alarmType
    user_settings.theme = payload.theme
    user_settings.disclaimer_accepted = payload.disclaimerAccepted
    user_settings.disclaimer_accepted_at = _parse_iso(payload.disclaimerAcceptedAt) if payload.disclaimerAcceptedAt else None
    user_settings.notifications_enabled = payload.notificationsEnabled
    user_settings.auto_start_next_cycle = payload.autoStartNextCycle
    user_settings.work_start_hour = payload.workStartHour
    user_settings.work_end_hour = payload.workEndHour
    db.commit()
    db.refresh(user_settings)
    return _to_schema(user_settings)
