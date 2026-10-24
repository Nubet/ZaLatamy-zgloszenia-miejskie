import { useLocalSearchParams } from 'expo-router';
import { ReportEditor } from '@/features/official/report-editor';
export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReportEditor key={id} id={id} />;
}
