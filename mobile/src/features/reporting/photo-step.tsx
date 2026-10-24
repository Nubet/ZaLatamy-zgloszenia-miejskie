import { View } from 'react-native';
import { Button, Card, Copy, Heading } from '@/shared/ui/primitives';
import { PhotoView } from '@/features/report-details/report-ui';
import type { ReportForm } from './use-report-form';

export function PhotoStep({ form }: { form: ReportForm }) {
  return (
    <View style={{ gap: 16 }}>
      <Heading title="Dodaj zdjęcia" description="Od 1 do 5 zdjęć. Pierwsze będzie główne." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {form.draft.photos.map((photo, index) => (
          <Card key={photo.id} style={{ width: '48%', padding: 8, gap: 4 }}>
            <PhotoView photo={photo} height={100} />
            <Copy muted size={12}>
              {index === 0 ? 'Główne' : `Zdjęcie ${index + 1}`}
            </Copy>
            <View style={{ gap: 8 }}>
              {index > 0 && (
                <Button
                  label="Ustaw jako główne"
                  variant="text"
                  onPress={() => form.cover(index)}
                />
              )}
              <Button label="Usuń" variant="danger" onPress={() => form.remove(index)} />
            </View>
          </Card>
        ))}
      </View>
      <Copy muted size={13}>
        {form.draft.photos.length}/5 zdjęć · maks. 8 MB na zdjęcie
      </Copy>
      <Button label="Zrób zdjęcie" variant="secondary" onPress={() => form.pick('camera')} />
      <Button label="Wybierz z galerii" variant="secondary" onPress={() => form.pick('library')} />
      <Button label="Dodaj przykładowe zdjęcie" variant="text" onPress={form.addDemo} />
    </View>
  );
}
