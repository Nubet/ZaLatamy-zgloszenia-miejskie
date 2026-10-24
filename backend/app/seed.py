from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .models import HistoryItem, Notification, Report, ReportImage, Watch

ENTRIES = [
    ("Ubytek w nawierzchni jezdni", "ul. Piotrkowska 140", "road", "progress", "high", 19.4592, 51.7559),
    ("Nie działa latarnia przy przejściu", "ul. Narutowicza 32", "lighting", "new", "high", 19.4728, 51.7736),
    ("Przepełnione kosze przy parku", "Park Źródliska", "waste", "accepted", "normal", 19.4805, 51.7528),
    ("Uszkodzony chodnik", "ul. Gdańska 58", "road", "new", "normal", 19.4474, 51.7682),
    ("Połamana gałąź nad alejką", "Park im. Sienkiewicza", "greenery", "resolved", "normal", 19.4658, 51.7602),
    ("Odpady przy ścieżce", "ul. Drewnowska 58", "waste", "new", "normal", 19.4443, 51.7846),
    ("Zniszczona ławka", "Pasaż Schillera", "other", "accepted", "low", 19.4602, 51.7624),
    ("Nierówna nawierzchnia ścieżki", "al. Politechniki 10", "road", "progress", "normal", 19.4512, 51.7441),
    ("Niedziałające oświetlenie alejki", "Park Staromiejski", "lighting", "resolved", "normal", 19.4578, 51.7841),
    ("Nielegalne wysypisko", "ul. Pomorska 110", "waste", "new", "high", 19.4911, 51.7812),
    ("Uszkodzone obrzeże trawnika", "ul. Kopcińskiego 31", "greenery", "accepted", "low", 19.4871, 51.7694),
    ("Zapadnięta kostka brukowa", "ul. Wólczańska 82", "road", "resolved", "normal", 19.4514, 51.7581),
]
WATCH_INDEXES = {0, 2, 3, 4, 8}
MINE_INDEXES = {0, 3, 4}
LOCAL = settings.default_resident_id


def seed_if_empty(db: Session) -> None:
    if db.scalar(select(Report.id).limit(1)):
        return
    apply_seed(db)


def apply_seed(db: Session) -> None:
    for index, (title, address, category, status, priority, longitude, latitude) in enumerate(ENTRIES):
        created = datetime(2026, 10, 10 + (index % 9), 9, 30, tzinfo=timezone.utc)
        report_id = f"LDZ-{1042 + index}"
        report = Report(
            id=report_id,
            title=title,
            address=address,
            category=category,
            status=status,
            priority=priority,
            longitude=longitude,
            latitude=latitude,
            description=(
                f"{title}. Problem utrudnia korzystanie z przestrzeni publicznej. "
                "Prosimy o sprawdzenie miejsca i podjęcie odpowiednich działań."
            ),
            author_id=LOCAL if index in MINE_INDEXES else f"author:{report_id}",
            duplicate_of=None,
            created_at=created,
        )
        report.images.append(
            ReportImage(
                key=f"/demo/{category}.svg",
                storage_key=None,
                content_type="image/svg+xml",
                sort_order=0,
            )
        )
        report.history.append(
            HistoryItem(
                id=f"seed-{index}",
                at=created,
                text="Zgłoszenie przyjęte do systemu.",
                status="new",
            )
        )
        if status != "new":
            report.history.append(
                HistoryItem(
                    id=f"seed-status-{index}",
                    at=datetime(2026, 10, 20, 8, 0, tzinfo=timezone.utc),
                    text=(
                        "Prace zakończone. Dziękujemy za zgłoszenie."
                        if status == "resolved"
                        else "Sprawa przekazana do odpowiedniej jednostki."
                    ),
                    status=status,
                )
            )
        if index in WATCH_INDEXES:
            report.watches.append(Watch(resident_id=LOCAL))
        db.add(report)

    db.add_all(
        [
            Notification(
                id="demo-notification-1",
                report_id="LDZ-1042",
                resident_id=LOCAL,
                title="Ubytek w nawierzchni jezdni — W realizacji",
                at=datetime(2026, 10, 20, 8, 0, tzinfo=timezone.utc),
                read=False,
            ),
            Notification(
                id="demo-notification-2",
                report_id="LDZ-1046",
                resident_id=LOCAL,
                title="Połamana gałąź nad alejką — Rozwiązane",
                at=datetime(2026, 10, 19, 12, 20, tzinfo=timezone.utc),
                read=False,
            ),
            Notification(
                id="demo-notification-3",
                report_id="LDZ-1044",
                resident_id=LOCAL,
                title="Przepełnione kosze przy parku — Przyjęte",
                at=datetime(2026, 10, 18, 10, 0, tzinfo=timezone.utc),
                read=True,
            ),
        ]
    )
    db.flush()
