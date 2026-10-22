import { expect, it, vi } from "vite-plus/test";
import { locateInLodz } from "./geolocation";

const position: GeolocationPosition = {
    coords: {
        longitude: 19.4592,
        latitude: 51.7559,
        accuracy: 24.2,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
    },
    timestamp: 0,
    toJSON: () => ({}),
};

it("requests a fresh accurate position and returns a point within Łódź", async () => {
    const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>((success) =>
        success(position),
    );
    await expect(locateInLodz({ getCurrentPosition })).resolves.toEqual({
        location: { longitude: 19.4592, latitude: 51.7559 },
        accuracy: 25,
    });
    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    });
});

it("rejects coordinates outside Łódź without accepting a wrong report location", async () => {
    const getCurrentPosition: Geolocation["getCurrentPosition"] = (success) =>
        success({
            ...position,
            coords: { ...position.coords, longitude: 21.0122, latitude: 52.2297 },
        });
    await expect(locateInLodz({ getCurrentPosition })).rejects.toThrow("poza Łodzią");
});

it.each([
    [1, "Brak zgody"],
    [2, "Nie udało się odczytać"],
    [3, "trwał zbyt długo"],
] as const)("handles GPS failure %s with a manual fallback", async (code, message) => {
    const getCurrentPosition: Geolocation["getCurrentPosition"] = (_success, error) =>
        error?.({ code, message: "", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
    await expect(locateInLodz({ getCurrentPosition })).rejects.toThrow(message);
});

it("supports browsers without geolocation", async () => {
    await expect(locateInLodz(undefined)).rejects.toThrow("nie udostępnia GPS");
});
