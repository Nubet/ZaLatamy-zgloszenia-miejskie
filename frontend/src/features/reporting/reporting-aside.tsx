import { Camera, MapPin, ShieldCheck, Sparkles, ArrowDown } from "lucide-react";

export function ReportingAside() {
    return (
        <aside className="reporting-aside">
            <div className="reporting-aside__illustration">
                <span>
                    <Camera size={24} />
                </span>
                <ArrowDown size={17} />
                <span className="reporting-aside__ai-symbol">
                    <Sparkles size={24} />
                </span>
                <ArrowDown size={17} />
                <span>
                    <ShieldCheck size={24} />
                </span>
            </div>
            <span className="eyebrow">MNIEJ PISANIA, WIĘCEJ DZIAŁANIA</span>
            <h2>
                Ty robisz zdjęcie.
                <br />
                AI pomaga z resztą.
            </h2>
            <p className="reporting-aside__intro">
                Rozpoznanie usterki, kategoria i gotowy opis — do sprawdzenia przed wysłaniem.
            </p>
            <ul className="reporting-aside__tips">
                <li>
                    <Camera size={16} />
                    <span>
                        <strong>Zdjęcie usterki</strong>
                        Pokaż problem z odległości pozwalającej ocenić skalę uszkodzenia.
                    </span>
                </li>
                <li>
                    <MapPin size={16} />
                    <span>
                        <strong>Lokalizacja</strong>
                        Wskaż punkt na mapie lub podaj najbliższy numer budynku albo skrzyżowanie.
                    </span>
                </li>
                <li>
                    <ShieldCheck size={16} />
                    <span>
                        <strong>Prywatność</strong>
                        Unikaj fotografowania twarzy, tablic rejestracyjnych i danych osobowych.
                    </span>
                </li>
            </ul>
        </aside>
    );
}
