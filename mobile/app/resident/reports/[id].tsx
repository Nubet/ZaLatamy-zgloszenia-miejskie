import { Stack, useLocalSearchParams } from 'expo-router';
import { ReportDetails } from '@/features/report-details/report-details';
export default function Page() { const { id } = useLocalSearchParams<{ id: string }>(); return <><Stack.Screen options={{ title: 'Szczegóły · Demo' }} /><ReportDetails key={id} id={id} /></>; }
