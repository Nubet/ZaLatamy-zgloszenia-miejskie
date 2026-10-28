# ZaŁatamy - inteligentne zgłoszenia miejskie

**Hackathon Future Smart City 2026, Łódź · Zespół MDM**

[![Prezentacja projektu](https://img.shields.io/badge/Prezentacja_projektu-Canva-6d5cbe?style=for-the-badge&logo=canva&logoColor=white)](https://canva.link/syfmebl82rv49yi)


[English version](#english)

ZaŁatamy to pomysł na prostsze zgłaszanie problemów w Łodzi: od dziur w drogach i uszkodzonych chodników po niedziałające latarnie czy nielegalne wysypiska. Mieszkaniec powinien móc zgłosić problem równie łatwo, jak zrobić zdjęcie i wysłać wiadomość, a następnie zobaczyć, co dzieje się ze sprawą.

## Czym jest ten projekt?

To **proof of concept (PoC)** — demonstracyjny frontend aplikacji mobilnej oraz aplikacji webowej. Prototyp pokazuje ścieżki mieszkańca i administratora, ale nie jest jeszcze miejskim systemem obsługi zgłoszeń.

Dane demonstracyjne są przechowywane lokalnie, osobno w każdej aplikacji i na każdym urządzeniu. Zgłoszenia nie trafiają do urzędu i nie synchronizują się między aplikacjami. Analiza zdjęć przez AI jest symulowana; nie działa rzeczywisty model AI. Powiadomienia mają charakter lokalnej demonstracji, a wybór roli nie jest logowaniem.

## Jak działa demonstracja?

1. **Mieszkaniec** wybiera tryb mieszkańca, dodaje zdjęcie i wskazuje lokalizację — może użyć GPS lub wybrać lokalizację demonstracyjną.
2. Uzupełnia opis ręcznie albo korzysta z symulowanej propozycji, sprawdza podobne zgłoszenia i zapisuje sprawę.
3. Przegląda zgłoszenia na mapie lub liście, obserwuje wybrane sprawy i sprawdza ich historię oraz demonstracyjne powiadomienia.
4. **Administrator** przełącza się do swojego trybu, przegląda kolejkę, aktualizuje status lub priorytet, dodaje komentarz i może powiązać podobne zgłoszenia.
5. Po powrocie do trybu mieszkańca można zobaczyć aktualizację sprawy w tej samej lokalnej demonstracji.

## Docelowa wizja

Docelowo AI rozpoznałaby rodzaj usterki na zdjęciu i zaproponowała opis, a system pomagałby wykrywać duplikaty i ustalać priorytet. Mieszkańcy otrzymywaliby powiadomienia o postępach, a jednostki miejskie zarządzałyby zgłoszeniami w panelu administracyjnym. Celem jest ograniczenie pracy potrzebnej do zgłoszenia problemu i poprawa informacji zwrotnej.

Dalszy rozwój zakłada poznanie procedur miejskich, ewentualną integrację z istniejącymi systemami, pilotaż w Łodzi i współpracę z Urzędem Miasta Łodzi. Rzeczywiste wdrożenie wymaga m.in. backendu, integracji AI, uwierzytelniania, synchronizacji danych i usługi powiadomień.

## Technologie i wymagania

- **Bun 1.3.6 lub nowszy** — wymagany do uruchomienia aplikacji mobilnej.
- **Node.js 24.11 lub nowszy** oraz **npm** — środowisko aplikacji webowej; Node.js jest również potrzebny dla Expo CLI.
- **Next.js, React, TypeScript** — aplikacja internetowa (`frontend/`).
- **Expo, React Native, Expo Router, TypeScript** — aplikacja mobilna (`mobile/`); do uruchomienia na telefonie potrzebna jest aplikacja Expo Go lub emulator.
- **MapLibre GL i React Map GL** — interaktywne mapy; do pobierania map potrzebne jest połączenie z internetem.
- **TanStack Query, Zod** — obsługa danych i ich walidacja. Dane demonstracyjne są zapisywane lokalnie w przeglądarce lub na urządzeniu.

Pełne listy zależności znajdują się w `frontend/package.json` i `mobile/package.json`.

## Uruchomienie

**Aplikacja internetowa** — w katalogu projektu:

```bash
cd frontend
npm ci
npm run dev
```

Otwórz adres [http://localhost:3000](http://localhost:3000).

**Aplikacja mobilna** — w osobnym terminalu, w katalogu projektu:

```bash
cd mobile
bun install --frozen-lockfile
bun start
```

Zeskanuj kod QR w Expo Go lub uruchom aplikację w emulatorze. Komputer i telefon muszą być w tej samej sieci WI-FI.

---

<a id="english"></a>
## English

### ZaŁatamy - smart city issue reporting

**Future Smart City Hackathon 2026, Łódź · Team MDM**

[![Project Presentation](https://img.shields.io/badge/View_Project_Presentation-Canva-6d5cbe?style=for-the-badge&logo=canva&logoColor=white)](https://canva.link/syfmebl82rv49yi)


ZaŁatamy is an idea for making it easier for Łódź residents to report damaged roads, broken streetlights, illegal dumping and other problems. The goal is to make reporting as easy as taking a photo and sending a message, while keeping residents informed about progress.

### Project status

This is a **proof of concept (PoC)**: a mobile frontend and a web application. It demonstrates resident and city official workflows; it is not yet a live city reporting system.

Demo data is stored locally and separately in each app and device. Reports are not sent to the city or synchronized between apps. AI photo analysis is simulated, notifications are local demo entries, and selecting a role is not authentication.

### Demo flow

1. A **resident** adds a photo and selects a location using GPS or a demo location.
2. They enter a description or use a simulated suggestion, review similar reports and save the report.
3. They browse reports on a map or list, follow issues and view their history and demo notifications.
4. An **official** switches roles, reviews the queue, updates the status or priority, adds a comment and can link similar reports.
5. Switching back to the resident shows the update in the same local demo.

### Intended development

The planned system would use AI to identify issues and suggest descriptions, help detect duplicates and set priorities, and notify residents about progress. A city dashboard would support report management. The longer-term goal is a pilot in Łódź and possible integration with existing city procedures and systems. A real deployment would require a backend, AI integration, authentication, data synchronization and a notification service.

### Technologies and requirements

- **Bun 1.3.6 or later** for the mobile app.
- **Node.js 24.11 or later** and **npm** for the web app; Node.js is also required by Expo CLI.
- **Next.js, React and TypeScript** for the web app; **Expo, React Native, Expo Router and TypeScript** for mobile. Use Expo Go or an emulator to run the mobile app.
- **MapLibre GL and React Map GL** for maps; an internet connection is needed to load map resources.
- **TanStack Query and Zod** for data handling and validation. Demo data is stored locally in the browser or on the device.

See `frontend/package.json` and `mobile/package.json` for complete dependency lists.

### Quick start

**Web:**

```bash
cd frontend
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Mobile**, in a separate terminal from the project root:

```bash
cd mobile
bun install --frozen-lockfile
bun start
```

Scan the QR code with Expo Go or use an emulator. Phone and Computer have to be in the same WIFI network.
