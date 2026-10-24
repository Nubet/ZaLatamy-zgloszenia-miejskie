'use dom';

import { Component, useCallback, useState, type ReactNode } from 'react';
import { Map, Layer, Marker, NavigationControl, Source, type MapRef } from 'react-map-gl/maplibre';
import { lodzBoundary } from '@/domain/reports/boundary';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export type MapPoint = {
  id: string;
  title: string;
  longitude: number;
  latitude: number;
  color: string;
};

type Props = {
  theme: 'light' | 'dark';
  points: MapPoint[];
  location?: { longitude: number; latitude: number };
  selectedId?: string;
  onSelect?: (id: string) => Promise<void>;
  onLocate?: (point: { longitude: number; latitude: number }) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};

export default function CityMap({
  theme,
  points,
  location,
  selectedId,
  onSelect,
  onLocate,
}: Props) {
  const [error, setError] = useState(false);
  const style = theme === 'light' ? 'positron-gl-style' : 'dark-matter-gl-style';
  const longitude = location?.longitude;
  const latitude = location?.latitude;
  const focus = useCallback(
    (map: MapRef | null) => {
      if (map && longitude !== undefined && latitude !== undefined)
        map.jumpTo({ center: [longitude, latitude], zoom: 15 });
    },
    [longitude, latitude],
  );
  return (
    <div className={`city-map city-map--${theme}`}>
      <MapBoundary>
        <Map
          key={style}
          ref={focus}
          initialViewState={{
            longitude: location?.longitude ?? 19.456,
            latitude: location?.latitude ?? 51.7592,
            zoom: location ? 15 : 12.3,
          }}
          mapStyle={`https://basemaps.cartocdn.com/gl/${style}/style.json`}
          minZoom={10}
          maxZoom={19}
          dragRotate={false}
          touchPitch={false}
          maxBounds={[19.264, 51.642, 19.702, 51.904]}
          onError={() => setError(true)}
          onIdle={() => setError(false)}
          onClick={
            onLocate
              ? (event) =>
                  void onLocate({ longitude: event.lngLat.lng, latitude: event.lngLat.lat })
              : undefined
          }
        >
          <NavigationControl showCompass={false} />
          <Source id="lodz-boundary" type="geojson" data={lodzBoundary}>
            <Layer
              id="lodz-outline"
              type="line"
              paint={{
                'line-color': theme === 'light' ? '#6240ce' : '#b198ec',
                'line-width': 2,
                'line-dasharray': [3, 3],
              }}
            />
          </Source>
          {points.map((point) => (
            <Marker key={point.id} longitude={point.longitude} latitude={point.latitude}>
              <button
                className={`city-map__marker ${point.id === selectedId ? 'city-map__marker--selected' : ''}`}
                style={{ color: point.color }}
                aria-label={point.title}
                onClick={(event) => {
                  event.stopPropagation();
                  void onSelect?.(point.id);
                }}
              >
                ●
              </button>
            </Marker>
          ))}
          {location && (
            <Marker longitude={location.longitude} latitude={location.latitude}>
              <span className="city-map__pin" aria-label="Wybrana lokalizacja">
                ＋
              </span>
            </Marker>
          )}
        </Map>
      </MapBoundary>
      {error && (
        <div role="status" className="city-map__error">
          Nie można pobrać mapy. Zgłoszenia są dostępne na liście.
        </div>
      )}
    </div>
  );
}

class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="city-map__error" role="alert">
          Nie można uruchomić mapy na tym urządzeniu. Skorzystaj z listy lub lokalizacji demo.{' '}
          <button onClick={() => this.setState({ failed: false })}>Ponów</button>
        </div>
      );
    return this.props.children;
  }
}
