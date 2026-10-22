"use client";

import { Check } from "lucide-react";
import { CityMap } from "@/features/map/city-map";
import { isWithinLodz } from "@/domain/reports/rules";
import type { Location } from "@/domain/reports/model";

export function LocationPicker({
    location,
    address,
    onChange,
    onAddress,
}: {
    location: Location | null;
    address: string;
    onChange: (location: Location, address: string) => void;
    onAddress: (address: string) => void;
}) {
    const valid = location && isWithinLodz(location);
    return (
        <div className="location-picker">
            <div className="location-picker__map">
                <CityMap
                    location={
                        location &&
                        Number.isFinite(location.longitude) &&
                        Number.isFinite(location.latitude)
                            ? location
                            : null
                    }
                    onLocate={(point) =>
                        onChange(point, address.trim() || "Miejsce wskazane na mapie, Łódź")
                    }
                />
            </div>
            <p className="form-hint">
                Kliknij lub dotknij mapy, aby ustawić albo poprawić punkt. Możesz też wpisać
                współrzędne.
            </p>
            <label className="field">
                Adres lub opis miejsca
                <input
                    value={address}
                    placeholder="Np. ul. Piotrkowska 140, przy przejściu dla pieszych"
                    onChange={(event) => onAddress(event.target.value)}
                    maxLength={160}
                    required
                />
            </label>
            <details className="location-picker__coordinate-details">
                <summary>Dokładne współrzędne lokalizacji</summary>
                <div className="location-picker__coordinates">
                    <label className="field">
                        Długość geograficzna
                        <input
                            type="number"
                            step="0.000001"
                            value={
                                location && Number.isFinite(location.longitude)
                                    ? location.longitude
                                    : ""
                            }
                            onChange={(event) =>
                                onChange(
                                    {
                                        latitude: location?.latitude ?? NaN,
                                        longitude:
                                            event.target.value === ""
                                                ? NaN
                                                : event.target.valueAsNumber,
                                    },
                                    address,
                                )
                            }
                        />
                    </label>
                    <label className="field">
                        Szerokość geograficzna
                        <input
                            type="number"
                            step="0.000001"
                            value={
                                location && Number.isFinite(location.latitude)
                                    ? location.latitude
                                    : ""
                            }
                            onChange={(event) =>
                                onChange(
                                    {
                                        longitude: location?.longitude ?? NaN,
                                        latitude:
                                            event.target.value === ""
                                                ? NaN
                                                : event.target.valueAsNumber,
                                    },
                                    address,
                                )
                            }
                        />
                    </label>
                </div>
            </details>
            {location && (
                <p
                    className={valid ? "validation-success" : "inline-error"}
                    role={valid ? undefined : "alert"}
                >
                    {valid ? (
                        <>
                            <Check size={15} /> Lokalizacja w obszarze Łodzi.
                        </>
                    ) : (
                        "Wybierz lokalizację w granicach Łodzi."
                    )}
                </p>
            )}
        </div>
    );
}
