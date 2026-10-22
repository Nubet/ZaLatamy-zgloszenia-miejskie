import { CircleAlert, LoaderCircle, SearchX } from "lucide-react";

export function LoadingState() {
    return (
        <output className="feedback">
            <LoaderCircle className="loading-indicator" size={25} />
            <p>Wczytujemy zgłoszenia…</p>
        </output>
    );
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
    return (
        <div className="feedback" role="alert">
            <CircleAlert size={28} />
            <h2>Nie udało się wykonać operacji</h2>
            <p>{message}</p>
            {retry && (
                <button className="button button--secondary" onClick={retry}>
                    Spróbuj ponownie
                </button>
            )}
        </div>
    );
}
export function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="feedback">
            <SearchX size={30} />
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
}
