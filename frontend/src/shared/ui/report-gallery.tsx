"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { ReportPhoto } from "./report-photo";

export function ReportGallery({
    images,
    title,
    className = "report-gallery__image",
}: {
    images: string[];
    title: string;
    className?: string;
}) {
    const [index, setIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const opener = useRef<HTMLButtonElement>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const current = Math.min(index, images.length - 1);
    const image = images[current];
    if (!image) return null;

    function move(direction: number) {
        setIndex((currentIndex) => (currentIndex + direction + images.length) % images.length);
    }
    function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();
            move(event.key === "ArrowLeft" ? -1 : 1);
        }
    }
    function startSwipe(event: TouchEvent<HTMLElement>) {
        const touch = event.touches[0];
        touchStart.current =
            event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null;
    }
    function endSwipe(event: TouchEvent<HTMLElement>) {
        const end = event.changedTouches[0];
        const start = touchStart.current;
        if (start && end) {
            const dx = end.clientX - start.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(end.clientY - start.y)) {
                event.preventDefault();
                move(dx < 0 ? 1 : -1);
            }
        }
        touchStart.current = null;
    }
    function close() {
        dialog.current?.close();
        setExpanded(false);
        opener.current?.focus({ preventScroll: true });
    }
    const navigation = images.length > 1 && (
        <div className="report-gallery__navigation">
            <button
                type="button"
                className="icon-button"
                aria-label="Poprzednie zdjęcie"
                onClick={() => move(-1)}
                onKeyDown={handleKeyDown}
            >
                <ChevronLeft size={20} />
            </button>
            <span aria-live="polite" aria-atomic="true">
                {current + 1} / {images.length}
            </span>
            <button
                type="button"
                className="icon-button"
                aria-label="Następne zdjęcie"
                onClick={() => move(1)}
                onKeyDown={handleKeyDown}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );

    return (
        <section className="report-gallery" aria-label={`Zdjęcia: ${title}`}>
            <button
                type="button"
                className="report-gallery__open"
                ref={opener}
                aria-label={`Powiększ zdjęcie ${current + 1} z ${images.length}`}
                onClick={() => setExpanded(true)}
                onKeyDown={handleKeyDown}
                onTouchStart={startSwipe}
                onTouchEnd={endSwipe}
                onTouchCancel={() => {
                    touchStart.current = null;
                }}
            >
                <ReportPhoto
                    image={image}
                    title={`${title} — zdjęcie ${current + 1}`}
                    className={className}
                />
                <span className="report-gallery__expand">
                    <Maximize2 size={16} />
                </span>
            </button>
            {navigation}
            {images.length > 1 && (
                <div className="report-gallery__thumbnails">
                    {images.map((source, position) => (
                        <button
                            type="button"
                            key={`${source}-${position}`}
                            aria-label={`Pokaż zdjęcie ${position + 1}`}
                            aria-pressed={current === position}
                            onClick={() => setIndex(position)}
                            onKeyDown={handleKeyDown}
                        >
                            <ReportPhoto image={source} title={`Zdjęcie ${position + 1}`} />
                        </button>
                    ))}
                </div>
            )}
            {expanded &&
                createPortal(
                    <dialog
                        className="report-gallery__lightbox"
                        aria-label={`Zdjęcia: ${title}`}
                        ref={(node) => {
                            dialog.current = node;
                            if (node && !node.open) node.showModal();
                        }}
                        onCancel={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            close();
                        }}
                        onKeyDown={(event) => {
                            event.stopPropagation();
                            handleKeyDown(event);
                        }}
                        onTouchStart={startSwipe}
                        onTouchEnd={endSwipe}
                        onTouchCancel={() => {
                            touchStart.current = null;
                        }}
                    >
                        <header>
                            <span>{title}</span>
                            <button
                                type="button"
                                className="icon-button"
                                aria-label="Zamknij zdjęcia"
                                onClick={close}
                            >
                                <X size={22} />
                            </button>
                        </header>
                        <ReportPhoto
                            image={image}
                            title={`${title} — zdjęcie ${current + 1}`}
                            className="report-gallery__full-image"
                        />
                        {navigation}
                    </dialog>,
                    document.fullscreenElement ?? document.body,
                )}
        </section>
    );
}
