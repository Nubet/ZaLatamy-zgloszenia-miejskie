import type { ReactElement } from 'react';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Report } from '@/domain/reports/model';
import { useTheme } from '@/shared/theme/provider';
import { Card, Copy } from '@/shared/ui/primitives';
import { ReportCard } from './report-ui';

export function ReportList({
  reports,
  allReports,
  header,
  onOpen,
}: {
  reports: Report[];
  allReports: Report[];
  header: ReactElement;
  onOpen: (id: string) => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={reports}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 14 }}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <Card>
          <Copy weight="600">Brak spraw w tym widoku</Copy>
          <Copy muted>Zmień filtry lub dodaj zgłoszenie.</Copy>
        </Card>
      }
      renderItem={({ item }) => (
        <ReportCard report={item} reports={allReports} onPress={() => onOpen(item.id)} />
      )}
    />
  );
}
