from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, Header, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session

from .config import settings
from .db import SessionLocal, get_db, init_db
from .schemas import AnalysisOut, CATEGORIES, ConfirmationIn, ReportOut, ReportUpdateIn, StateOut
from .seed import seed_if_empty
from .services import (
    create_report,
    fail,
    load_state,
    mark_read,
    photo_payload,
    reset_demo,
    set_confirmation,
    toggle_watch,
    update_report,
)
from .storage import ensure_bucket


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    ensure_bucket()
    if settings.auto_seed:
        db = SessionLocal()
        try:
            seed_if_empty(db)
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
    yield


app = FastAPI(title="ZaŁatamy API", lifespan=lifespan)
origins = [item.strip() for item in settings.cors_origins.split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def resident_id(x_resident_id: Annotated[str | None, Header()] = None) -> str:
    value = (x_resident_id or settings.default_resident_id).strip()
    if not value:
        fail("Brak identyfikatora mieszkańca.")
    return value


Resident = Annotated[str, Depends(resident_id)]
Db = Annotated[Session, Depends(get_db)]


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/state", response_model=StateOut)
def get_state(db: Db, resident: Resident):
    return load_state(db, resident)


@app.post("/api/reports", response_model=ReportOut)
async def post_report(
    db: Db,
    resident: Resident,
    title: Annotated[str, Form()],
    description: Annotated[str, Form()],
    category: Annotated[str, Form()],
    address: Annotated[str, Form()],
    longitude: Annotated[float, Form()],
    latitude: Annotated[float, Form()],
    photos: Annotated[list[UploadFile], File()],
):
    files: list[tuple[bytes, str]] = []
    for photo in photos:
        files.append((await photo.read(), photo.content_type or ""))
    return create_report(
        db,
        resident,
        title,
        description,
        category,
        address,
        longitude,
        latitude,
        files,
    )


@app.patch("/api/reports/{report_id}")
def patch_report(report_id: str, payload: ReportUpdateIn, db: Db, resident: Resident):
    update_report(db, resident, report_id, payload)
    return {"ok": True}


@app.post("/api/reports/{report_id}/watch")
def watch_report(report_id: str, db: Db, resident: Resident):
    toggle_watch(db, resident, report_id)
    return {"ok": True}


@app.post("/api/reports/{report_id}/confirmation")
def confirm_report(report_id: str, payload: ConfirmationIn, db: Db, resident: Resident):
    return {"id": set_confirmation(db, resident, report_id, payload.confirmed)}


@app.post("/api/notifications/{notification_id}/read")
def read_notification(notification_id: str, db: Db, resident: Resident):
    mark_read(db, resident, notification_id)
    return {"ok": True}


@app.post("/api/reset")
def reset(db: Db):
    reset_demo(db)
    return {"ok": True}


@app.get("/api/photos")
def get_photo(key: str, db: Db):
    payload = photo_payload(db, key)
    if not payload:
        fail("Nie znaleziono zdjęcia.", 404)
    body, content_type = payload
    return Response(content=body, media_type=content_type, headers={"Cache-Control": "private, max-age=3600"})


@app.post("/api/analysis", response_model=AnalysisOut)
async def analyze(
    scenario: Annotated[str, Form()],
    photo: Annotated[UploadFile | None, File()] = None,
):
    if photo is not None:
        await photo.read()
    if scenario == "error":
        fail("Nie udało się przygotować opisu. Spróbuj ponownie lub uzupełnij go samodzielnie.")
    if scenario not in CATEGORIES:
        fail("Nieprawidłowa kategoria.")
    label = CATEGORIES[scenario].lower()
    return AnalysisOut(
        title={
            "road": "Uszkodzona nawierzchnia chodnika",
            "lighting": "Niedziałająca latarnia uliczna",
            "waste": "Odpady w przestrzeni publicznej",
            "greenery": "Uszkodzona zieleń przy alejce",
            "other": "Uszkodzony element wyposażenia miejskiego",
        }[scenario],
        description=(
            f"Zauważono problem w kategorii: {label}. Usterka utrudnia korzystanie "
            "z przestrzeni publicznej i wymaga sprawdzenia przez odpowiednie służby miejskie."
        ),
        category=scenario,  # type: ignore[arg-type]
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
