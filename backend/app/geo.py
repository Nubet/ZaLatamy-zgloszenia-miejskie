import json
from functools import lru_cache
from pathlib import Path

BOUNDARY_PATH = Path(__file__).resolve().parent / "data" / "lodz-boundary.json"


@lru_cache(maxsize=1)
def lodz_ring() -> list[tuple[float, float]]:
    payload = json.loads(BOUNDARY_PATH.read_text(encoding="utf-8"))
    return [(float(lon), float(lat)) for lon, lat in payload["geometry"]["coordinates"][0]]


def is_within_lodz(longitude: float, latitude: float) -> bool:
    if not (abs(longitude) <= 180 and abs(latitude) <= 90):
        return False
    ring = lodz_ring()
    inside = False
    x, y = longitude, latitude
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        intersects = (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 0.0) + x1
        if intersects:
            inside = not inside
    return inside
