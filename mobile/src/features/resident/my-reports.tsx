import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { localResidentId } from '@/domain/reports/model';
import { Button, Card, Choice, Copy } from '@/shared/ui/primitives';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { ReportList } from '@/features/report-details/report-list';

export function MyReports() {
  const [tab, setTab] = useState<'mine' | 'watching'>('mine');
  return (
    <ReportsBoundary>
      {(state) => (
        <ReportList
          allReports={state.reports}
          reports={state.reports.filter((report) =>
            tab === 'mine' ? report.authorId === localResidentId : report.watching,
          )}
          onOpen={(id) => router.push({ pathname: '/resident/reports/[id]', params: { id } })}
          header={
            <View style={{ gap: 16, marginBottom: 6 }}>
              {state.draft && (
                <Card>
                  <Copy weight="600">{state.draft.title || 'Niedokończone zgłoszenie'}</Copy>
                  <Button
                    variant="secondary"
                    label="Wznów szkic"
                    onPress={() => router.push('/resident/new-report')}
                  />
                </Card>
              )}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Choice
                  label="Utworzone"
                  selected={tab === 'mine'}
                  onPress={() => setTab('mine')}
                />
                <Choice
                  label="Obserwowane"
                  selected={tab === 'watching'}
                  onPress={() => setTab('watching')}
                />
              </View>
            </View>
          }
        />
      )}
    </ReportsBoundary>
  );
}
