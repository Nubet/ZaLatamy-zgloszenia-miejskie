from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .db import Base
from .geo import is_within_lodz
from .models import Confirmation, HistoryItem, Notification, Report, ReportImage, Watch
from .schemas import (
    COMMENT_MAX,
    COMMENT_MIN,
    MAX_PHOTOS,
    STATUSES,
    HistoryOut,
    Location,
    NotificationOut,
    ReportOut,
    ReportUpdateIn,
    StateOut,
)
from .storage import (
    ALLOWED_TYPES,
    MAX_PHOTO_BYTES,
    delete_keys,
    list_photo_keys,
    put_photo,
)
from .seed import apply_seed


def fail(message: str, status: int = 400) -> None:
    raise HTTPException(status_code=status, detail=message)


def now() -> datetime:
    return datetime.now(timezone.utc)


def load_reports(db: Session) -> list[Report]:
    return list(
        db.scalars(
            select(Report)
            .options(
                selectinload(Report.images),
                selectinload(Report.history),
                selectinload(Report.confirmations),
                selectinload(Report.watches),
            )
            .order_by(Report.created_at.desc(), Report.id.desc())
        ).all()
    )


def find_report(reports: list[Report], report_id: str) -> Report:
    for item in reports:
        if item.id == report_id:
            return item
    fail("Nie znaleziono zgłoszenia.", 404)
    raise AssertionError


def primary_report(report: Report, reports: list[Report]) -> Report:
    by_id = {item.id: item for item in reports}
    visited: set[str] = set()
    current = report
    while current.duplicate_of:
        if current.id in visited:
            fail("Wykryto cykl połączonych zgłoszeń.")
        visited.add(current.id)
        nxt = by_id.get(current.duplicate_of)
        if not nxt:
            fail("Nie znaleziono sprawy nadrzędnej.")
        current = nxt
    return current


def related_reports(report: Report, reports: list[Report]) -> list[Report]:
    primary = primary_report(report, reports)
    return [item for item in reports if primary_report(item, reports).id == primary.id]


def accepts_confirmations(report: Report) -> bool:
    return report.status in {"new", "accepted", "progress"}


def to_out(report: Report, resident_id: str) -> ReportOut:
    return ReportOut(
        title=report.title,
        description=report.description,
        category=report.category,  # type: ignore[arg-type]
        location=Location(longitude=report.longitude, latitude=report.latitude),
        address=report.address,
        priority=report.priority,  # type: ignore[arg-type]
        id=report.id,
        createdAt=report.created_at,
        status=report.status,  # type: ignore[arg-type]
        images=[image.key for image in sorted(report.images, key=lambda item: item.sort_order)],
        mine=report.author_id == resident_id,
        authorId=report.author_id,
        confirmations=[item.resident_id for item in report.confirmations],
        watching=any(item.resident_id == resident_id for item in report.watches),
        duplicateOf=report.duplicate_of,
        history=[
            HistoryOut(id=item.id, at=item.at, text=item.text, status=item.status)  # type: ignore[arg-type]
            for item in sorted(report.history, key=lambda item: item.at)
        ],
    )


def load_state(db: Session, resident_id: str) -> StateOut:
    reports = load_reports(db)
    notifications = db.scalars(
        select(Notification)
        .where(Notification.resident_id == resident_id)
        .order_by(Notification.at.desc())
    ).all()
    return StateOut(
        reports=[to_out(item, resident_id) for item in reports],
        notifications=[
            NotificationOut(
                id=item.id,
                reportId=item.report_id,
                title=item.title,
                at=item.at,
                read=item.read,
            )
            for item in notifications
        ],
    )


def validate_update(report: Report, update: ReportUpdateIn, reports: list[Report]) -> None:
    comment = update.comment.strip()
    if update.status in {"rejected", "duplicate"} and len(comment) < COMMENT_MIN:
        fail(f"Dodaj uzasadnienie (minimum {COMMENT_MIN} znaków).")
    if len(update.comment) > COMMENT_MAX:
        fail(f"Komentarz może mieć maksymalnie {COMMENT_MAX} znaków.")
    if update.status != "duplicate":
        return
    target = next((item for item in reports if item.id == update.duplicateOf), None)
    if not target or target.id == report.id:
        fail("Wybierz inne istniejące zgłoszenie.")
    visited = {report.id}
    by_id = {item.id: item for item in reports}
    current: Report | None = target
    while current:
        if current.id in visited:
            fail("Powiązanie utworzyłoby cykl duplikatów.")
        visited.add(current.id)
        current = by_id.get(current.duplicate_of) if current.duplicate_of else None
    if report.duplicate_of != target.id and not accepts_confirmations(primary_report(target, reports)):
        fail("Wybierz aktywną sprawę nadrzędną.")


def create_report(
    db: Session,
    resident_id: str,
    title: str,
    description: str,
    category: str,
    address: str,
    longitude: float,
    latitude: float,
    photos: list[tuple[bytes, str]],
) -> ReportOut:
    title = title.strip()
    description = description.strip()
    address = address.strip()
    if len(title) < 5 or len(title) > 120:
        fail("Tytuł musi mieć co najmniej 5 znaków.")
    if len(description) < 15 or len(description) > 2000:
        fail("Opisz problem w co najmniej 15 znakach.")
    if category not in {"road", "lighting", "waste", "greenery", "other"}:
        fail("Nieprawidłowa kategoria.")
    if len(address) < 3 or len(address) > 160:
        fail("Podaj adres zgłoszenia.")
    if not is_within_lodz(longitude, latitude):
        fail("Wybierz lokalizację w granicach Łodzi.")
    if not photos or len(photos) > MAX_PHOTOS:
        fail(f"Dodaj od 1 do {MAX_PHOTOS} zdjęć.")

    report_id = f"LDZ-{uuid.uuid4().hex[:8].upper()}"
    created_at = now()
    stored: list[str] = []
    report = Report(
        id=report_id,
        title=title,
        description=description,
        category=category,
        address=address,
        longitude=longitude,
        latitude=latitude,
        priority="normal",
        status="new",
        author_id=resident_id,
        duplicate_of=None,
        created_at=created_at,
    )
    try:
        for index, (body, content_type) in enumerate(photos):
            if content_type not in ALLOWED_TYPES:
                fail("Wybierz zdjęcie JPG, PNG lub WebP.")
            if not body:
                fail("Plik jest pusty.")
            if len(body) > MAX_PHOTO_BYTES:
                fail("Zdjęcie może mieć maksymalnie 8 MB.")
            ext = ALLOWED_TYPES[content_type]
            storage_key = f"photos/{report_id}/{index}{ext}"
            put_photo(storage_key, body, content_type)
            stored.append(storage_key)
            report.images.append(
                ReportImage(
                    key=f"photo:{report_id}:{index}",
                    storage_key=storage_key,
                    content_type=content_type,
                    sort_order=index,
                )
            )
        report.history.append(
            HistoryItem(
                id=str(uuid.uuid4()),
                at=created_at,
                text="Zgłoszenie zostało zapisane. Oczekuje na weryfikację.",
                status="new",
            )
        )
        report.watches.append(Watch(resident_id=resident_id))
        db.add(report)
        db.flush()
    except Exception:
        delete_keys(stored)
        raise
    return to_out(report, resident_id)


def update_report(db: Session, resident_id: str, report_id: str, update: ReportUpdateIn) -> None:
    reports = load_reports(db)
    report = find_report(reports, report_id)
    validate_update(report, update, reports)
    at = now()
    status_changed = report.status != update.status
    priority_changed = report.priority != update.priority
    report.status = update.status
    report.priority = update.priority
    report.duplicate_of = update.duplicateOf if update.status == "duplicate" else None
    comment = update.comment.strip()
    if comment:
        text = comment
    elif status_changed:
        text = f"Status zmieniony na: {STATUSES[update.status]}."
    elif priority_changed:
        text = "Zaktualizowano priorytet zgłoszenia."
    else:
        text = "Zweryfikowano zgłoszenie."
    report.history.append(
        HistoryItem(
            id=str(uuid.uuid4()),
            at=at,
            text=text,
            status=update.status if status_changed else None,
        )
    )
    related = related_reports(report, reports)
    if status_changed:
        recipients: set[str] = set()
        for item in related:
            recipients.add(item.author_id)
            recipients.update(watch.resident_id for watch in item.watches)
        title = (
            f"{report.title} — połączono ze sprawą {primary_report(report, reports).id}"
            if update.status == "duplicate"
            else f"{report.title} — {STATUSES[update.status]}"
        )
        for recipient in recipients:
            db.add(
                Notification(
                    id=str(uuid.uuid4()),
                    report_id=report.id,
                    resident_id=recipient,
                    title=title,
                    at=at,
                    read=False,
                )
            )
    db.flush()


def toggle_watch(db: Session, resident_id: str, report_id: str) -> None:
    reports = load_reports(db)
    related = related_reports(find_report(reports, report_id), reports)
    watching = not any(
        any(watch.resident_id == resident_id for watch in item.watches) for item in related
    )
    for item in related:
        existing = [watch for watch in item.watches if watch.resident_id == resident_id]
        if watching and not existing:
            item.watches.append(Watch(resident_id=resident_id))
        if not watching:
            for watch in existing:
                db.delete(watch)
    db.flush()


def set_confirmation(db: Session, resident_id: str, report_id: str, confirmed: bool) -> str:
    reports = load_reports(db)
    report = primary_report(find_report(reports, report_id), reports)
    if not accepts_confirmations(report):
        fail("Ta sprawa jest zakończona. Nie można zmieniać potwierdzeń.")
    related = related_reports(report, reports)
    if any(item.author_id == resident_id for item in related):
        if not confirmed:
            fail("Autor zgłoszenia jest już liczony jako jedno potwierdzenie.")
        return report.id
    for item in related:
        for row in [row for row in item.confirmations if row.resident_id == resident_id]:
            db.delete(row)
    if confirmed:
        report.confirmations.append(Confirmation(resident_id=resident_id))
    db.flush()
    return report.id


def mark_read(db: Session, resident_id: str, notification_id: str) -> None:
    item = db.get(Notification, notification_id)
    if item and item.resident_id == resident_id:
        item.read = True
        db.flush()


def reset_demo(db: Session) -> None:
    keys = [
        image.storage_key
        for image in db.scalars(select(ReportImage).where(ReportImage.storage_key.is_not(None))).all()
        if image.storage_key
    ]
    try:
        keys.extend(list_photo_keys())
    except Exception:
        pass
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.flush()
    apply_seed(db)
    try:
        delete_keys(list(dict.fromkeys(keys)))
    except Exception:
        pass


def photo_payload(db: Session, key: str) -> tuple[bytes, str] | None:
    image = db.scalars(select(ReportImage).where(ReportImage.key == key)).first()
    if not image or not image.storage_key:
        return None
    from .storage import get_photo

    return get_photo(image.storage_key)
