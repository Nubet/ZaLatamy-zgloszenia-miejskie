"use client";

import { useRef, useState } from "react";
import { RotateCcw, LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useReportMutation } from "@/application/reports/provider";

export function DemoControls() {
    const dialog = useRef<HTMLDialogElement>(null);
    const client = useQueryClient();
    const [done, setDone] = useState(false);
    const reset = useReportMutation((gateway) => gateway.reset());

    return (
        <>
            <button
                className="demo-controls__reset"
                onClick={() => {
                    setDone(false);
                    reset.reset();
                    dialog.current?.showModal();
                }}
            >
                <RotateCcw size={12} />
                Resetuj demo
            </button>
            {done && (
                <output className="demo-controls__success">
                    Dane demonstracyjne zostały przywrócone.
                </output>
            )}
            <dialog
                ref={dialog}
                className="demo-controls__dialog"
                onCancel={(event) => {
                    if (reset.isPending) event.preventDefault();
                }}
                aria-labelledby="reset-title"
            >
                <h2 id="reset-title">Przywrócić dane początkowe?</h2>
                <p>
                    Wszystkie lokalne zmiany, dodane zdjęcia oraz nowo utworzone zgłoszenia zostaną
                    zastąpione domyślnym zestawem demonstracyjnym.
                </p>
                <div className="button-row">
                    <button
                        className="button button--secondary"
                        disabled={reset.isPending}
                        onClick={() => dialog.current?.close()}
                    >
                        Anuluj
                    </button>
                    <button
                        className="button button--primary"
                        disabled={reset.isPending}
                        onClick={() =>
                            reset.mutate(undefined, {
                                onSuccess: () => {
                                    client.removeQueries({ queryKey: ["photo"] });
                                    setDone(true);
                                    dialog.current?.close();
                                },
                            })
                        }
                    >
                        {reset.isPending ? (
                            <LoaderCircle className="loading-indicator" size={14} />
                        ) : (
                            <RotateCcw size={14} />
                        )}
                        Przywróć dane demo
                    </button>
                </div>
                {reset.error && (
                    <p className="inline-error" role="alert">
                        {reset.error.message}
                    </p>
                )}
            </dialog>
        </>
    );
}
