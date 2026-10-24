import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { Button, Copy, Notice, Screen } from '@/shared/ui/primitives';
import type { Report, SavedDraft } from '@/domain/reports/model';
import { useTheme } from '@/shared/theme/provider';
import { useReportForm } from './use-report-form';
import { PhotoStep } from './photo-step';
import { LocationStep } from './location-step';
import { ReviewStep } from './review-step';

export function ReportForm() {
  return (
    <ReportsBoundary>
      {(state) => <Form initial={state.draft} reports={state.reports} />}
    </ReportsBoundary>
  );
}
function Form({ initial, reports }: { initial: SavedDraft | null; reports: Report[] }) {
  const form = useReportForm(initial);
  const { colors } = useTheme();
  const titles = ['Zdjęcia', 'Lokalizacja', 'Opis'];
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: 'Zgłoś problem', gestureEnabled: !form.busy }} />
      <Screen>
        <View style={{ gap: 16 }}>
          <Copy muted size={12}>
            Krok {form.draft.step + 1} z 3
          </Copy>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {titles.map((title, index) => (
              <View
                key={title}
                style={{
                  flex: 1,
                  height: 3,
                  backgroundColor: index <= form.draft.step ? colors.accent : colors.border,
                  borderRadius: 2,
                }}
              />
            ))}
          </View>
        </View>
        <View
          pointerEvents={form.busy ? 'none' : 'auto'}
          style={{ gap: 20, opacity: form.busy ? 0.6 : 1 }}
        >
          {form.draft.step === 0 ? (
            <PhotoStep form={form} />
          ) : form.draft.step === 1 ? (
            <LocationStep form={form} />
          ) : (
            <ReviewStep form={form} reports={reports} />
          )}
        </View>
        <Notice error message={form.error} />
        <Notice message={form.notice} />
        <View style={{ gap: 10 }}>
          {form.draft.step < 2 && (
            <Button
              label="Dalej"
              pending={form.busy}
              onPress={() => form.next(form.draft.step + 1)}
            />
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {form.draft.step > 0 && (
              <Button
                label="Wstecz"
                variant="text"
                disabled={form.busy}
                onPress={() => form.next(form.draft.step - 1)}
              />
            )}
            <Button label="Zachowaj szkic" variant="text" pending={form.busy} onPress={form.save} />
          </View>
          {initial && (
            <Button
              label="Usuń szkic"
              variant="danger"
              disabled={form.busy}
              onPress={form.discard}
            />
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
