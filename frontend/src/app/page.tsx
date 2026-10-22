import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUp,
    ArrowUpRight,
    Bell,
    Bookmark,
    Camera,
    Check,
    ChevronDown,
    Lightbulb,
    MapPin,
    Plus,
    Route,
    Sparkles,
    ThumbsUp,
    Trash2,
    Trees,
} from "lucide-react";
import { LandingOverview } from "@/features/landing/landing-overview";
import { LandingHeader } from "@/features/landing/landing-header";
import { StatusBadge } from "@/shared/ui/report-badges";
import styles from "@/features/landing/landing.module.css";

export const metadata: Metadata = {
    title: "Załatamy · Zgłoszenia miejskie w Łodzi",
    description:
        "Zgłoś problem w Łodzi. Napisz opis samodzielnie lub skorzystaj z AI, które przygotuje go ze zdjęcia. Przeglądaj mapę i śledź postępy spraw.",
};

export default function HomePage() {
    return (
        <div className={styles.landing} id="poczatek">
            <a className="skip-link" href="#tresc">
                Przejdź do treści
            </a>
            <LandingHeader />

            <main id="tresc">
                <section className={styles["landing__hero"]} aria-labelledby="hero-title">
                    <div className={styles["landing__hero-backdrop"]} aria-hidden="true" />
                    <div className={styles["landing__hero-copy"]}>
                        <span className={styles["landing__location"]}>
                            <MapPin size={13} aria-hidden="true" /> Łódź · Zgłoszenia mieszkańców
                        </span>
                        <h1 id="hero-title">
                            Zgłoś problem
                            <br />
                            <span>w swojej okolicy.</span>
                        </h1>
                        <p>
                            Zgłoś uszkodzony chodnik lub niedziałającą latarnię. Opisz problem
                            samodzielnie albo dodaj zdjęcie i poproś AI o przygotowanie opisu. Potem
                            sprawdzaj postępy zgłoszenia.
                        </p>
                        <div className={styles["landing__actions"]}>
                            <Link href="/zgloszenia/nowe" className="button button--primary">
                                <Plus size={16} aria-hidden="true" /> Zgłoś problem
                            </Link>
                            <Link href="/mapa" className="button button--secondary">
                                Obejrzyj mapę <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                        <p className={styles["landing__access-note"]}>
                            Mapa jest dostępna bez konta i logowania.
                        </p>
                    </div>
                    <div className={styles["landing__hero-preview"]}>
                        <LandingOverview />
                    </div>
                </section>

                <section
                    id="co-zglosic"
                    className={styles["landing__categories"]}
                    aria-labelledby="categories-title"
                >
                    <div className={styles["landing__container"]}>
                        <div className={styles["landing__section-heading"]}>
                            <span className={styles["landing__eyebrow"]}>
                                SPRAWY Z TWOJEJ OKOLICY
                            </span>
                            <h2 id="categories-title">Co możesz zgłosić</h2>
                            <p>
                                Załatamy służy do zgłaszania usterek i problemów w przestrzeni
                                publicznej na terenie Łodzi.
                            </p>
                        </div>
                        <ul className={styles["landing__category-list"]}>
                            <li>
                                <span className={styles["landing__category-icon"]}>
                                    <Route size={27} strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <h3>Drogi i chodniki</h3>
                                <p>Dziury w jezdni i uszkodzone nawierzchnie.</p>
                            </li>
                            <li>
                                <span
                                    className={`${styles["landing__category-icon"]} ${styles["landing__category-icon--lighting"]}`}
                                >
                                    <Lightbulb size={27} strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <h3>Oświetlenie</h3>
                                <p>Niedziałające lub uszkodzone latarnie.</p>
                            </li>
                            <li>
                                <span
                                    className={`${styles["landing__category-icon"]} ${styles["landing__category-icon--waste"]}`}
                                >
                                    <Trash2 size={27} strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <h3>Odpady</h3>
                                <p>Przepełnione kosze i porzucone śmieci.</p>
                            </li>
                            <li>
                                <span
                                    className={`${styles["landing__category-icon"]} ${styles["landing__category-icon--greenery"]}`}
                                >
                                    <Trees size={27} strokeWidth={1.5} aria-hidden="true" />
                                </span>
                                <h3>Zieleń</h3>
                                <p>Zniszczone nasadzenia i uszkodzone drzewa.</p>
                            </li>
                        </ul>
                    </div>
                </section>

                <section
                    id="jak-zglosic"
                    className={`${styles["landing__container"]} ${styles["landing__workflow"]}`}
                    aria-labelledby="guide-title"
                >
                    <div className={styles["landing__feature-copy"]}>
                        <span className={styles["landing__eyebrow"]}>DODAWANIE ZGŁOSZENIA</span>
                        <h2 id="guide-title">
                            Opisz samodzielnie
                            <br />
                            lub skorzystaj z AI.
                        </h2>
                        <p>
                            Najpierw sprawdź mapę. Jeśli usterka nie jest jeszcze zgłoszona, przejdź
                            do formularza.
                        </p>
                        <ol className={styles["landing__steps"]}>
                            <li>
                                <span>01</span>
                                <div>
                                    <h3>Dodaj zdjęcia</h3>
                                    <p>Dołącz do pięciu zdjęć pokazujących usterkę.</p>
                                </div>
                            </li>
                            <li>
                                <span>02</span>
                                <div>
                                    <h3>Wskaż miejsce</h3>
                                    <p>
                                        Zaznacz punkt na mapie lub użyj lokalizacji telefonu.
                                        Sprawdź adres.
                                    </p>
                                </div>
                            </li>
                            <li>
                                <span>03</span>
                                <div>
                                    <h3>Opisz i wyślij</h3>
                                    <p>
                                        Napisz opis samodzielnie lub zleć AI przygotowanie opisu i
                                        kategorii ze zdjęcia. Sprawdź treść i wyślij zgłoszenie.
                                    </p>
                                </div>
                            </li>
                        </ol>
                        <Link href="/zgloszenia/nowe" className="text-link">
                            Przejdź do formularza <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className={styles["landing__form-stage"]}>
                        <figure className={styles["landing__form-preview"]}>
                            <figcaption className={styles["landing__preview-heading"]}>
                                <Sparkles size={15} aria-hidden="true" /> Przykład opisu
                                zaproponowanego przez AI
                            </figcaption>
                            <div className={styles["landing__preview-body"]}>
                                <div className={styles["landing__preview-stepper"]}>
                                    <span>
                                        <Check size={12} aria-hidden="true" /> Zdjęcia
                                    </span>
                                    <span>
                                        <Check size={12} aria-hidden="true" /> Miejsce
                                    </span>
                                    <strong>
                                        3 <span>Opis</span>
                                    </strong>
                                </div>
                                <span className={styles["landing__preview-label"]}>
                                    Tytuł zgłoszenia
                                </span>
                                <div className={styles["landing__preview-field"]}>
                                    Uszkodzony chodnik przy przejściu
                                </div>
                                <div className={styles["landing__preview-meta"]}>
                                    <span>
                                        <Route size={14} aria-hidden="true" /> Drogi i chodniki
                                    </span>
                                    <span>
                                        <Camera size={14} aria-hidden="true" /> 2 zdjęcia
                                    </span>
                                </div>
                                <span className={styles["landing__preview-label"]}>
                                    Opis problemu
                                </span>
                                <div className={styles["landing__preview-field"]}>
                                    Zapadnięte płyty chodnikowe przy przejściu dla pieszych
                                    utrudniają przejazd wózkiem.
                                </div>
                                <div className={styles["landing__preview-location"]}>
                                    <MapPin size={14} aria-hidden="true" />
                                    <span>Lokalizacja wskazana na mapie</span>
                                    <Check size={13} aria-hidden="true" />
                                </div>
                            </div>
                        </figure>
                        <div className={styles["landing__ai-assistance"]}>
                            <Sparkles size={17} aria-hidden="true" />
                            <div>
                                <h3>AI przygotuje opis na podstawie zdjęcia</h3>
                                <p>
                                    AI przeanalizuje zdjęcie i zaproponuje opis oraz kategorię
                                    zgłoszenia. Możesz zmienić propozycję przed wysłaniem.
                                    Korzystanie z AI jest opcjonalne.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className={styles["landing__tracking-section"]}
                    aria-labelledby="tracking-title"
                >
                    <div
                        className={`${styles["landing__container"]} ${styles["landing__tracking"]}`}
                    >
                        <div className={styles["landing__history-preview"]}>
                            <div className={styles["landing__preview-heading"]}>
                                <Bookmark size={15} aria-hidden="true" /> Przykładowy przebieg
                                sprawy
                            </div>
                            <ol className={styles["landing__status-timeline"]}>
                                <li>
                                    <span className={styles["landing__status-dot"]} />
                                    <div>
                                        <StatusBadge status="new" />
                                        <p>Zgłoszenie zapisane z nadanym numerem sprawy.</p>
                                    </div>
                                </li>
                                <li>
                                    <span className={styles["landing__status-dot"]} />
                                    <div>
                                        <StatusBadge status="accepted" />
                                        <p>Sprawa przyjęta do obsługi.</p>
                                    </div>
                                </li>
                                <li>
                                    <span className={styles["landing__status-dot"]} />
                                    <div>
                                        <StatusBadge status="progress" />
                                        <p>Trwają działania związane ze zgłoszeniem.</p>
                                    </div>
                                </li>
                                <li>
                                    <span
                                        className={`${styles["landing__status-dot"]} ${styles["landing__status-dot--resolved"]}`}
                                    />
                                    <div>
                                        <StatusBadge status="resolved" />
                                        <p>Problem oznaczony jako rozwiązany.</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                        <div className={styles["landing__feature-copy"]}>
                            <span className={styles["landing__eyebrow"]}>PO WYSŁANIU</span>
                            <h2 id="tracking-title">
                                Sprawdzaj, co dzieje się
                                <br />z Twoją sprawą.
                            </h2>
                            <p>
                                W panelu znajdziesz swoje zgłoszenia. Każde ma numer, aktualny
                                status i historię z publicznymi komentarzami dotyczącymi podjętych
                                działań.
                            </p>
                            <div className={styles["landing__tracking-feature"]}>
                                <Bell size={18} aria-hidden="true" />
                                <div>
                                    <h3>Obserwuj także inne sprawy</h3>
                                    <p>
                                        Włącz obserwację zgłoszenia. Aktualizacje pojawią się w
                                        powiadomieniach w Twoim panelu.
                                    </p>
                                </div>
                            </div>
                            <div className={styles["landing__tracking-feature"]}>
                                <ThumbsUp size={18} aria-hidden="true" />
                                <div>
                                    <h3>Potwierdź „Też to widzę”</h3>
                                    <p>
                                        Jeśli ktoś zgłosił już tę samą usterkę, możesz ją
                                        potwierdzić. Nie musisz dodawać kolejnego zgłoszenia.
                                    </p>
                                </div>
                            </div>
                            <Link href="/panel" className="text-link">
                                Otwórz panel mieszkańca <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section
                    id="pytania"
                    className={`${styles["landing__container"]} ${styles["landing__faq"]}`}
                    aria-labelledby="faq-title"
                >
                    <div className={styles["landing__faq-intro"]}>
                        <span className={styles["landing__eyebrow"]}>PYTANIA I ODPOWIEDZI</span>
                        <h2 id="faq-title">
                            Zanim dodasz
                            <br />
                            zgłoszenie
                        </h2>
                        <p>O mapie, przygotowaniu opisu i obsłudze spraw.</p>
                        <Link href="/mapa" className="text-link">
                            Obejrzyj mapę zgłoszeń <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className={styles["landing__faq-items"]}>
                        <details>
                            <summary>
                                Czy do oglądania mapy potrzebuję konta?
                                <ChevronDown size={17} aria-hidden="true" />
                            </summary>
                            <p>
                                Nie. Publiczną mapę otworzysz bez logowania. Możesz wyszukać ulicę
                                lub numer zgłoszenia, wybrać status i przeczytać szczegóły sprawy.
                            </p>
                        </details>
                        <details>
                            <summary>
                                Co zrobić, jeśli ktoś zgłosił już tę samą usterkę?
                                <ChevronDown size={17} aria-hidden="true" />
                            </summary>
                            <p>
                                Otwórz istniejące zgłoszenie i potwierdź je przyciskiem „Też to
                                widzę”. Możesz też włączyć obserwację, żeby otrzymywać aktualizacje
                                w panelu. Jeśli chodzi o inną usterkę w tym samym miejscu, dodaj
                                osobne zgłoszenie.
                            </p>
                        </details>
                        <details>
                            <summary>
                                Czy muszę korzystać z AI przy zgłaszaniu problemu?
                                <ChevronDown size={17} aria-hidden="true" />
                            </summary>
                            <p>
                                Nie. Możesz napisać opis i wybrać kategorię samodzielnie. Jeśli
                                skorzystasz z AI, aplikacja przeanalizuje zdjęcie i zaproponuje
                                treść zgłoszenia. Sprawdź, czy opis odpowiada temu, co widzisz na
                                miejscu. Przed wysłaniem możesz zmienić tytuł, opis i kategorię.
                            </p>
                        </details>
                        <details>
                            <summary>
                                Co oznacza odrzucenie lub połączenie zgłoszenia?
                                <ChevronDown size={17} aria-hidden="true" />
                            </summary>
                            <p>
                                Odrzucona sprawa nie będzie dalej realizowana. Sprawdź uzasadnienie
                                w jej historii. Połączone zgłoszenie dotyczy problemu opisanego już
                                w innej sprawie; dalsze działania znajdziesz w zgłoszeniu głównym.
                            </p>
                        </details>
                    </div>
                </section>

                <section className={styles["landing__closing"]} aria-labelledby="closing-title">
                    <div className={styles["landing__closing-backdrop"]} aria-hidden="true" />
                    <div className={styles["landing__closing-content"]}>
                        <MapPin size={23} strokeWidth={1.5} aria-hidden="true" />
                        <h2 id="closing-title">Sprawdź swoją okolicę</h2>
                        <p>
                            Obejrzyj zgłoszenia przy swojej ulicy lub dodaj problem, którego jeszcze
                            nie ma na mapie.
                        </p>
                        <div className={styles["landing__actions"]}>
                            <Link href="/mapa" className="button button--primary">
                                Otwórz mapę <ArrowUpRight size={15} aria-hidden="true" />
                            </Link>
                            <Link href="/zgloszenia/nowe" className="button button--secondary">
                                <Plus size={15} aria-hidden="true" /> Zgłoś problem
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={`${styles["landing__container"]} ${styles["landing__footer"]}`}>
                <div className={styles["landing__footer-main"]}>
                    <div className={styles["landing__footer-brand"]}>
                        <Link
                            href="/"
                            className={styles["landing__brand"]}
                            aria-label="ZaŁatamy — strona główna"
                        >
                            <span className={styles["landing__logo"]} aria-hidden="true" />
                            <strong>ZaŁatamy</strong>
                        </Link>
                        <p>
                            Zgłoszenia miejskie w Łodzi.
                            <br />
                            Mapa usterek i informacje o Twoich sprawach.
                        </p>
                    </div>
                    <nav aria-label="Zgłoszenia">
                        <h2>Zgłoszenia</h2>
                        <Link href="/mapa">Mapa miasta</Link>
                        <Link href="/zgloszenia/nowe">Zgłoś problem</Link>
                    </nav>
                    <nav aria-label="Twój panel">
                        <h2>Twój panel</h2>
                        <Link href="/panel">Panel mieszkańca</Link>
                        <Link href="/moje-zgloszenia">Moje zgłoszenia</Link>
                        <Link href="/powiadomienia">Powiadomienia</Link>
                    </nav>
                    <nav aria-label="Pomoc">
                        <h2>Jak korzystać</h2>
                        <a href="#co-zglosic">Co możesz zgłosić</a>
                        <a href="#jak-zglosic">Jak to działa</a>
                        <a href="#pytania">Pytania i odpowiedzi</a>
                    </nav>
                </div>
                <div className={styles["landing__footer-bottom"]}>
                    <span>ZaŁatamy · Łódź</span>
                    <a href="#poczatek">
                        Wróć na górę <ArrowUp size={14} aria-hidden="true" />
                    </a>
                </div>
            </footer>
        </div>
    );
}
