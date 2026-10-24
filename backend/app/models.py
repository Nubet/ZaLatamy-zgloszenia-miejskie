from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(32))
    address: Mapped[str] = mapped_column(String(160))
    longitude: Mapped[float]
    latitude: Mapped[float]
    priority: Mapped[str] = mapped_column(String(16), default="normal")
    status: Mapped[str] = mapped_column(String(16), default="new")
    author_id: Mapped[str] = mapped_column(String(80), index=True)
    duplicate_of: Mapped[str | None] = mapped_column(
        String(32), ForeignKey("reports.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    images: Mapped[list["ReportImage"]] = relationship(
        back_populates="report", cascade="all, delete-orphan", order_by="ReportImage.sort_order"
    )
    history: Mapped[list["HistoryItem"]] = relationship(
        back_populates="report", cascade="all, delete-orphan", order_by="HistoryItem.at"
    )
    confirmations: Mapped[list["Confirmation"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )
    watches: Mapped[list["Watch"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )


class ReportImage(Base):
    __tablename__ = "report_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    key: Mapped[str] = mapped_column(String(80))
    storage_key: Mapped[str | None] = mapped_column(String(200), nullable=True)
    content_type: Mapped[str] = mapped_column(String(80), default="application/octet-stream")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    report: Mapped[Report] = relationship(back_populates="images")


class HistoryItem(Base):
    __tablename__ = "report_history"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    text: Mapped[str] = mapped_column(Text)
    status: Mapped[str | None] = mapped_column(String(16), nullable=True)

    report: Mapped[Report] = relationship(back_populates="history")


class Confirmation(Base):
    __tablename__ = "report_confirmations"
    __table_args__ = (UniqueConstraint("report_id", "resident_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    resident_id: Mapped[str] = mapped_column(String(80), index=True)

    report: Mapped[Report] = relationship(back_populates="confirmations")


class Watch(Base):
    __tablename__ = "report_watches"
    __table_args__ = (UniqueConstraint("report_id", "resident_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    resident_id: Mapped[str] = mapped_column(String(80), index=True)

    report: Mapped[Report] = relationship(back_populates="watches")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    resident_id: Mapped[str] = mapped_column(String(80), index=True)
    title: Mapped[str] = mapped_column(String(240))
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    read: Mapped[bool] = mapped_column(default=False)

    report: Mapped[Report] = relationship(back_populates="notifications")
