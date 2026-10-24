import type { ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { categories, priorities, type Report } from '@/domain/reports/model';
import { relatedReports, reportSupport } from '@/domain/reports/rules';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Copy, Heading, Screen } from '@/shared/ui/primitives';
import { formatDate } from '@/shared/lib/format';
import CityMap from '@/features/map/city-map';
import { ReportsBoundary } from './reports-boundary';
import { Gallery, StatusBadge } from './report-ui';

export function ReportDetails({
  id,
  official = false,
  actions,
}: {
  id: string;
  official?: boolean;
  actions?: (report: Report, reports: Report[]) => ReactNode;
}) {
  const { name } = useTheme();
  return (
    <ReportsBoundary>
      {(state) => {
        const report = state.reports.find((item) => item.id === id);
        if (!report)
          return (
            <Screen>
              <Heading title="Nie znaleziono sprawy" />
              <Button
                label="Wróć do spraw"
                onPress={() => router.replace(official ? '/official' : '/resident')}
              />
            </Screen>
          );
        const linked = relatedReports(report, state.reports).filter(
          (item) => item.id !== report.id,
        );
        const open = (reportId: string) =>
          router.push({
            pathname: official ? '/official/reports/[id]' : '/resident/reports/[id]',
            params: { id: reportId },
          });
        return (
          <Screen>
            <Heading eyebrow={report.id} title={report.title} />
            <StatusBadge status={report.status} />
            {actions?.(report, state.reports)}
            <Gallery key={report.id} photos={report.photos} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <Copy muted size={13}>
                {categories[report.category]}
              </Copy>
              <Copy muted size={13}>
                Priorytet: {priorities[report.priority]}
              </Copy>
              <Copy muted size={13}>
                {reportSupport(report, state.reports).count} osób potwierdza
              </Copy>
            </View>
            <Copy>{report.description}</Copy>
            <Card>
              <Copy weight="600">{report.address}</Copy>
              <Copy muted size={13}>
                Zgłoszono {formatDate(report.createdAt)}
              </Copy>
              <View style={{ height: 200, overflow: 'hidden', borderRadius: 10 }}>
                <CityMap
                  theme={name}
                  points={[]}
                  location={report.location}
                  dom={{ style: { flex: 1 }, scrollEnabled: false, useExpoDOMWebView: false }}
                />
              </View>
            </Card>
            {report.duplicateOf && (
              <Card>
                <Copy weight="600">Ta sprawa została połączona</Copy>
                <Button
                  variant="secondary"
                  label={`Otwórz ${report.duplicateOf}`}
                  onPress={() => open(report.duplicateOf!)}
                />
              </Card>
            )}
            <Heading title="Historia sprawy" />
            {[...report.history].reverse().map((item) => (
              <Card key={item.id}>
                <Copy muted size={12}>
                  {formatDate(item.at)}
                </Copy>
                {item.status && <StatusBadge status={item.status} />}
                <Copy>{item.text}</Copy>
              </Card>
            ))}
            {!report.duplicateOf && linked.length > 0 && (
              <Card>
                <Copy weight="600">Powiązane zgłoszenia</Copy>
                {linked.map((item) => (
                  <Button
                    key={item.id}
                    variant="secondary"
                    label={`${item.id} · ${item.title}`}
                    onPress={() => open(item.id)}
                  />
                ))}
              </Card>
            )}
          </Screen>
        );
      }}
    </ReportsBoundary>
  );
}
