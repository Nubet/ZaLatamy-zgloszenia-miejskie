import { View } from 'react-native';
import { categories, type Report } from '@/domain/reports/model';
import { nearbyReports } from '@/domain/reports/rules';
import { Button, Card, Choice, Copy, Field, Heading } from '@/shared/ui/primitives';
import type { ReportForm } from './use-report-form';

export function ReviewStep({ form, reports }: { form: ReportForm; reports: Report[] }) {
  const similar = form.draft.location
    ? nearbyReports(reports, form.draft.category, form.draft.location)
    : [];
  return (
    <View style={{ gap: 16 }}>
      <Heading title="Opis problemu" />
      <Copy weight="600">Kategoria</Copy>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(categories).map(([key, label]) => (
          <Choice
            key={key}
            label={label}
            selected={form.draft.category === key}
            onPress={() => form.change({ category: key as keyof typeof categories })}
          />
        ))}
      </View>
      <Button label="Wstaw przykładowy opis" variant="text" onPress={form.describe} />
      <Field
        label="Tytuł"
        value={form.draft.title}
        editable={!form.busy}
        maxLength={120}
        onChangeText={(title) => form.change({ title })}
        onBlur={form.saveOnBlur}
      />
      <Field
        label="Opis problemu"
        value={form.draft.description}
        editable={!form.busy}
        multiline
        maxLength={2000}
        onChangeText={(description) => form.change({ description })}
        onBlur={form.saveOnBlur}
      />
      {similar.length > 0 && (
        <Card>
          <Copy weight="600">Podobne sprawy w promieniu 100 m</Copy>
          <Copy muted size={13}>
            To ten sam problem? Potwierdź istniejące zgłoszenie.
          </Copy>
          {similar.map(({ report, meters }) => (
            <Button
              key={report.id}
              label={`${report.title} · ${Math.round(meters)} m`}
              variant="secondary"
              onPress={() => form.openExisting(report.id)}
            />
          ))}
          <Choice
            label="Sprawdziłem — zgłaszam osobny problem"
            selected={form.reviewed}
            onPress={() => form.setReviewed(!form.reviewed)}
          />
        </Card>
      )}
      <Card>
        <Copy weight="600">Podsumowanie</Copy>
        <Copy muted>
          {form.draft.address}
          {'\n'}
          {form.draft.photos.length} zdjęć · {categories[form.draft.category]}
        </Copy>
      </Card>
      <Button
        label="Dodaj zgłoszenie"
        pending={form.busy}
        onPress={() => form.submit(similar.length > 0)}
      />
    </View>
  );
}
