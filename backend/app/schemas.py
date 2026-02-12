from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AuthUserOut(BaseModel):
    id: UUID
    email: EmailStr
    email_verified: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    user: AuthUserOut


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class SettingsOut(BaseModel):
    workIntervalMinutes: int
    breakDurationMinutes: int
    alarmVolume: float
    alarmType: str
    theme: str
    disclaimerAccepted: bool
    disclaimerAcceptedAt: str | None
    notificationsEnabled: bool
    autoStartNextCycle: bool
    workStartHour: int
    workEndHour: int


class SettingsIn(BaseModel):
    workIntervalMinutes: int
    breakDurationMinutes: int
    alarmVolume: float
    alarmType: str
    theme: str
    disclaimerAccepted: bool
    disclaimerAcceptedAt: str | None
    notificationsEnabled: bool
    autoStartNextCycle: bool
    workStartHour: int
    workEndHour: int


class BreakSessionCreateIn(BaseModel):
    date: str
    startedAt: str
    exerciseIds: list[str]
    durationPlannedSeconds: int


class BreakSessionCompleteIn(BaseModel):
    completedAt: str
    durationActualSeconds: int


class BreakSessionOut(BaseModel):
    id: str
    date: str
    startedAt: str
    completedAt: str | None
    completed: bool
    exerciseIds: list[str]
    durationPlannedSeconds: int
    durationActualSeconds: int


class DailyRecordOut(BaseModel):
    date: str
    sessionsExpected: int
    sessionsStarted: int
    sessionsCompleted: int
    compliancePercent: int


class ExpectedSessionsIn(BaseModel):
    sessionsExpected: int = Field(ge=0)
