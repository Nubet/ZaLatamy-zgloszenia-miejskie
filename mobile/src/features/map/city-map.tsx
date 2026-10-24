'use dom';

import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

export type MapPoint = { id: string; title: string; longitude: number; latitude: number; color: string };

type Props = {
  theme: 'light' | 'dark';
  points: MapPoint[];
  location?: { longitude: number; latitude: number };
  selectedId?: string;
  onSelect?: (id: string) => Promise<void>;
  onLocate?: (point: { longitude: number; latitude: number }) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};

export default function CityMap({ theme, points, location, selectedId, onSelect, onLocate }: Props) {
  const [error, setError] = useState(false);
  const style = theme === 'light' ? 'positron-gl-style' : 'dark-matter-gl-style';
  return <div className={`city-map city-map--${theme}`}>
    <Map
      key={style}
      initialViewState={{ longitude: location?.longitude ?? 19.456, latitude: location?.latitude ?? 51.7592, zoom: location ? 15 : 12.3 }}
      mapStyle={`https://basemaps.cartocdn.com/gl/${style}/style.json`}
      minZoom={10} maxZoom={19} dragRotate={false} touchPitch={false}
      onError={() => setError(true)} onIdle={() => setError(false)}
      onClick={onLocate ? (event) => void onLocate({ longitude: event.lngLat.lng, latitude: event.lngLat.lat }) : undefined}
    >
      <NavigationControl showCompass={false} />
      {points.map(point => <Marker key={point.id} longitude={point.longitude} latitude={point.latitude}>
        <button className={`city-map__marker ${point.id === selectedId ? 'city-map__marker--selected' : ''}`} style={{ color: point.color }} aria-label={point.title} onClick={event => { event.stopPropagation(); void onSelect?.(point.id); }}>●</button>
      </Marker>)}
      {location && <Marker longitude={location.longitude} latitude={location.latitude}><span className="city-map__pin" aria-label="Wybrana lokalizacja">＋</span></Marker>}
    </Map>
    {error && <div role="status" className="city-map__error">Nie można pobrać mapy. Zgłoszenia są dostępne na liście.</div>}
  </div>;
}
