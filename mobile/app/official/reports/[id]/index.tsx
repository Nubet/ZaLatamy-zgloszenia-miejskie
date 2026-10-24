import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ReportDetails } from '@/features/report-details/report-details';
import { Button } from '@/shared/ui/primitives';
export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'Obsługa sprawy · Demo' }} />
      <ReportDetails
        key={id}
        id={id}
        official
        actions={() => (
          <Button
            label="Aktualizuj sprawę"
            onPress={() => router.push({ pathname: '/official/reports/[id]/edit', params: { id } })}
          />
        )}
      />
    </>
  );
}
