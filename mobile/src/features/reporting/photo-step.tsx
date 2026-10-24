import { View } from 'react-native';
import { Button, Card, Copy, Heading } from '@/shared/ui/primitives';
import { PhotoView } from '@/features/report-details/report-ui';
import type { ReportForm } from './use-report-form';

export function PhotoStep({ form }: { form: ReportForm }) {
  return <View style={{ gap: 16 }}><Heading title="Pokaż problem" description="Dodaj od 1 do 5 zdjęć. Pierwsze będzie zdjęciem głównym." />
    {form.draft.photos.map((photo, index) => <Card key={photo.id}><PhotoView photo={photo} height={160} /><Copy muted size={12}>{index === 0 ? 'ZDJĘCIE GŁÓWNE' : `ZDJĘCIE ${index + 1}`}</Copy><View style={{ gap: 8 }}>{index > 0 && <Button label="Ustaw jako główne" variant="secondary" onPress={() => form.cover(index)} />}<Button label="Usuń zdjęcie" variant="danger" onPress={() => form.remove(index)} /></View></Card>)}
    <Copy muted size={13}>{form.draft.photos.length}/5 zdjęć · do 8 MB po przygotowaniu</Copy><Button label="Zrób zdjęcie" variant="secondary" onPress={() => form.pick('camera')} /><Button label="Wybierz z galerii" variant="secondary" onPress={() => form.pick('library')} /><Button label="Użyj ilustracji demo" variant="secondary" onPress={form.addDemo} />
  </View>;
}
