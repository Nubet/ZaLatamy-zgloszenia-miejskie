import { useState } from 'react';
import { View } from 'react-native';
import CityMap from '@/features/map/city-map';
import { useTheme } from '@/shared/theme/provider';
import { Button, Field, Heading, Sheet } from '@/shared/ui/primitives';
import type { ReportForm } from './use-report-form';

const places = [
  { label: 'Piotrkowska 140', longitude: 19.4592, latitude: 51.7559 },
  { label: 'Park Źródliska', longitude: 19.4805, latitude: 51.7528 },
  { label: 'Gdańska 58', longitude: 19.4474, latitude: 51.7682 },
];
export function LocationStep({ form }: { form: ReportForm }) {
  const { name } = useTheme();
  const [placesOpen, setPlacesOpen] = useState(false);
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
          dom={{ style: { flex: 1 }, scrollEnabled: false, useExpoDOMWebView: false }}
        />
      </View>
      <Button label="Użyj mojej lokalizacji" variant="secondary" onPress={form.locate} />
      <Field
        label="Adres lub opis miejsca"
        value={form.draft.address}
        editable={!form.busy}
        maxLength={160}
        onChangeText={(address) => form.change({ address })}
        onBlur={form.saveOnBlur}
        placeholder="Ulica, numer lub charakterystyczny punkt"
      />
      <Button
        label="Wybierz przykładową lokalizację"
        variant="text"
        onPress={() => setPlacesOpen(true)}
      />
      <Sheet
        title="Przykładowe lokalizacje"
        visible={placesOpen}
        onClose={() => setPlacesOpen(false)}
      >
        {places.map((place) => (
          <Button
            key={place.label}
            variant="secondary"
            label={place.label}
            onPress={() => {
              form.setLocation(place, place.label);
              setPlacesOpen(false);
            }}
          />
        ))}
      </Sheet>
    </View>
  );
}
