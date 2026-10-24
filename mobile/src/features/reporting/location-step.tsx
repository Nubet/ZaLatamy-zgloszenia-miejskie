import { View } from 'react-native';
import CityMap from '@/features/map/city-map';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Copy, Field, Heading } from '@/shared/ui/primitives';
import type { ReportForm } from './use-report-form';

const places = [
  { label: 'Piotrkowska 140', longitude: 19.4592, latitude: 51.7559 },
  { label: 'Park Źródliska', longitude: 19.4805, latitude: 51.7528 },
  { label: 'Gdańska 58', longitude: 19.4474, latitude: 51.7682 },
];
export function LocationStep({ form }: { form: ReportForm }) {
  const { name } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      <Heading
        title="Wskaż miejsce"
        description="Dotknij mapy lub skorzystaj z lokalizacji telefonu."
      />
      <View style={{ height: 320, borderRadius: 12, overflow: 'hidden' }}>
        <CityMap
          theme={name}
          points={[]}
          location={form.draft.location ?? undefined}
          onLocate={async (point) => form.setLocation(point)}
          dom={{ style: { flex: 1 }, scrollEnabled: false }}
        />
      </View>
      <Button label="Użyj mojej lokalizacji" variant="secondary" onPress={form.locate} />
      {form.draft.location && (
        <Copy muted size={12}>
          {form.draft.location.latitude.toFixed(5)}° N, {form.draft.location.longitude.toFixed(5)}°
          E
        </Copy>
      )}
      <Field
        label="Adres lub opis miejsca"
        value={form.draft.address}
        editable={!form.busy}
        maxLength={160}
        onChangeText={(address) => form.change({ address })}
        onBlur={form.saveOnBlur}
        placeholder="Ulica, numer lub charakterystyczny punkt"
      />
      <Card>
        <Copy weight="600">Lokalizacje demonstracyjne</Copy>
        {places.map((place) => (
          <Button
            key={place.label}
            variant="secondary"
            label={place.label}
            onPress={() => form.setLocation(place, place.label)}
          />
        ))}
      </Card>
    </View>
  );
}
