import { Stack, useLocalSearchParams } from 'expo-router';
import { ReportDetails } from '@/features/report-details/report-details';
import { ResidentActions } from '@/features/resident/report-actions';
export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ title: 'Szczegóły · Demo' }} />
      <ReportDetails
        key={id}
        id={id}
        actions={(report, reports) => <ResidentActions report={report} reports={reports} />}
      />
    </>
  );
}
