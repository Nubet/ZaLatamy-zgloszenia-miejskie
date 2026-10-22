import {
    localResidentId,
    type DemoState,
    type Report,
    type Category,
    type Status,
    type Priority,
} from "@/domain/reports/model";

const entries: [string, string, Category, Status, Priority, number, number][] = [
    [
        "Ubytek w nawierzchni jezdni",
        "ul. Piotrkowska 140",
        "road",
        "progress",
        "high",
        19.4592,
        51.7559,
    ],
    [
        "Nie działa latarnia przy przejściu",
        "ul. Narutowicza 32",
        "lighting",
        "new",
        "high",
        19.4728,
        51.7736,
    ],
    [
        "Przepełnione kosze przy parku",
        "Park Źródliska",
        "waste",
        "accepted",
        "normal",
        19.4805,
        51.7528,
    ],
    ["Uszkodzony chodnik", "ul. Gdańska 58", "road", "new", "normal", 19.4474, 51.7682],
    [
        "Połamana gałąź nad alejką",
        "Park im. Sienkiewicza",
        "greenery",
        "resolved",
        "normal",
        19.4658,
        51.7602,
    ],
    ["Odpady przy ścieżce", "ul. Drewnowska 58", "waste", "new", "normal", 19.4443, 51.7846],
    ["Zniszczona ławka", "Pasaż Schillera", "other", "accepted", "low", 19.4602, 51.7624],
    [
        "Nierówna nawierzchnia ścieżki",
        "al. Politechniki 10",
        "road",
        "progress",
        "normal",
        19.4512,
        51.7441,
    ],
    [
        "Niedziałające oświetlenie alejki",
        "Park Staromiejski",
        "lighting",
        "resolved",
        "normal",
        19.4578,
        51.7841,
    ],
    ["Nielegalne wysypisko", "ul. Pomorska 110", "waste", "new", "high", 19.4911, 51.7812],
    [
        "Uszkodzone obrzeże trawnika",
        "ul. Kopcińskiego 31",
        "greenery",
        "accepted",
        "low",
        19.4871,
        51.7694,
    ],
    [
        "Zapadnięta kostka brukowa",
        "ul. Wólczańska 82",
        "road",
        "resolved",
        "normal",
        19.4514,
        51.7581,
    ],
];
export function createSeed(): DemoState {
    const reports: Report[] = entries.map(
        ([title, address, category, status, priority, longitude, latitude], index) => {
            const createdAt = `2026-10-${String(10 + (index % 9)).padStart(2, "0")}T09:30:00.000Z`;
            return {
                id: `LDZ-${1042 + index}`,
                title,
                address,
                category,
                status,
                priority,
                location: { longitude, latitude },
                description: `${title}. Problem utrudnia korzystanie z przestrzeni publicznej. Prosimy o sprawdzenie miejsca i podjęcie odpowiednich działań.`,
                images: [`/demo/${category}.svg`],
                createdAt,
                mine: index === 0 || index === 3 || index === 4,
                authorId: [0, 3, 4].includes(index)
                    ? localResidentId
                    : `author:LDZ-${1042 + index}`,
                confirmations: [],
                watching: [0, 2, 3, 4, 8].includes(index),
                duplicateOf: null,
                history: [
                    {
                        id: `seed-${index}`,
                        at: createdAt,
                        text: "Zgłoszenie przyjęte do systemu.",
                        status: "new",
                    },
                    ...(status === "new"
                        ? []
                        : [
                              {
                                  id: `seed-status-${index}`,
                                  at: "2026-10-20T08:00:00.000Z",
                                  text:
                                      status === "resolved"
                                          ? "Prace zakończone. Dziękujemy za zgłoszenie."
                                          : "Sprawa przekazana do odpowiedniej jednostki.",
                                  status,
                              },
                          ]),
                ],
            };
        },
    );
    return {
        version: 1,
        reports,
        notifications: [
            {
                id: "demo-notification-1",
                reportId: "LDZ-1042",
                title: "Ubytek w nawierzchni jezdni — W realizacji",
                at: "2026-10-20T08:00:00.000Z",
                read: false,
            },
            {
                id: "demo-notification-2",
                reportId: "LDZ-1046",
                title: "Połamana gałąź nad alejką — Rozwiązane",
                at: "2026-10-19T12:20:00.000Z",
                read: false,
            },
            {
                id: "demo-notification-3",
                reportId: "LDZ-1044",
                title: "Przepełnione kosze przy parku — Przyjęte",
                at: "2026-10-18T10:00:00.000Z",
                read: true,
            },
        ],
    };
}
