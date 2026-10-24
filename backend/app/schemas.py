from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_serializer


def iso(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

Category = Literal["road", "lighting", "waste", "greenery", "other"]
Status = Literal["new", "accepted", "progress", "resolved", "rejected", "duplicate"]
Priority = Literal["low", "normal", "high"]
STATUSES = {
    "new": "Nowe",
    "accepted": "Przyjęte",
    "progress": "W realizacji",
    "resolved": "Rozwiązane",
    "rejected": "Odrzucone",
    "duplicate": "Połączone",
}
CATEGORIES = {
    "road": "Drogi i chodniki",
    "lighting": "Oświetlenie",
    "waste": "Odpady",
    "greenery": "Zieleń",
    "other": "Inne",
}
MAX_PHOTOS = 5
COMMENT_MIN = 5
COMMENT_MAX = 2000


class Location(BaseModel):
    longitude: float = Field(ge=-180, le=180)
    latitude: float = Field(ge=-90, le=90)


class HistoryOut(BaseModel):
    id: str
    at: datetime
    text: str
    status: Status | None

    @field_serializer("at")
    def _at(self, value: datetime) -> str:
        return iso(value)


class ReportOut(BaseModel):
    title: str
    description: str
    category: Category
    location: Location
    address: str
    priority: Priority
    id: str
    createdAt: datetime
    status: Status
    images: list[str]
    mine: bool
    authorId: str
    confirmations: list[str]
    watching: bool
    duplicateOf: str | None
    history: list[HistoryOut]

    @field_serializer("createdAt")
    def _created(self, value: datetime) -> str:
        return iso(value)


class NotificationOut(BaseModel):
    id: str
    reportId: str
    title: str
    at: datetime
    read: bool

    @field_serializer("at")
    def _at(self, value: datetime) -> str:
        return iso(value)


class StateOut(BaseModel):
    version: Literal[1] = 1
    reports: list[ReportOut]
    notifications: list[NotificationOut]


class ReportUpdateIn(BaseModel):
    status: Status
    priority: Priority
    comment: str = ""
    duplicateOf: str | None = None


class ConfirmationIn(BaseModel):
    confirmed: bool


class AnalysisOut(BaseModel):
    title: str
    description: str
    category: Category
