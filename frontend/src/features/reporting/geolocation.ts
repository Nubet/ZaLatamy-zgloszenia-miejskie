import { isWithinLodz } from "@/domain/reports/rules";
import type { Location } from "@/domain/reports/model";

export function locateInLodz(geolocation: Pick<Geolocation, "getCurrentPosition"> | undefined) {
    return new Promise<{ location: Location; accuracy: number }>((resolve, reject) => {
        if (!geolocation) {
            reject(new Error("Twoja przeglądarka nie udostępnia GPS. Wskaż miejsce na mapie."));
            return;
        }
        geolocation.getCurrentPosition(
            ({ coords }) => {
                const location = { longitude: coords.longitude, latitude: coords.latitude };
                if (!isWithinLodz(location)) {
                    reject(
                        new Error(
                            "Odczyt GPS wskazuje miejsce poza Łodzią. Wskaż problem na mapie.",
                        ),
                    );
                    return;
                }
                resolve({ location, accuracy: Math.ceil(coords.accuracy) });
            },
            (error) => {
                const message =
                    error.code === 1
                        ? "Brak zgody na lokalizację. Możesz wskazać miejsce na mapie."
                        : error.code === 3
                          ? "Odczyt GPS trwał zbyt długo. Spróbuj ponownie lub wskaż miejsce na mapie."
                          : "Nie udało się odczytać GPS. Wskaż miejsce na mapie lub spróbuj ponownie.";
                reject(new Error(message));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    });
}
