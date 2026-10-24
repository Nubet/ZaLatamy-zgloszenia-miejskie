import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { DemoState } from '@/domain/reports/model';
import { Copy, Field } from '@/shared/ui/primitives';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { ReportList } from '@/features/report-details/report-list';
import { defaultFilters, filterWorkReports, type WorkView } from './work-queue';
import { WorkControls } from './work-filters';

export function WorkScreen({ view }: { view: WorkView }) {
  return (
    <ReportsBoundary>{(state) => <Queue key={view} view={view} state={state} />}</ReportsBoundary>
  );
}
function Queue({ view, state }: { view: WorkView; state: DemoState }) {
  const [filters, setFilters] = useState(() => defaultFilters(view));
  const filtered = filterWorkReports(state.reports, view, filters);
  return (
    <ReportList
      reports={filtered}
      allReports={state.reports}
      onOpen={(id) => router.push({ pathname: '/official/reports/[id]', params: { id } })}
      header={
        <View style={{ gap: 16, marginBottom: 6 }}>
          <Field
            label="Szukaj sprawy"
            placeholder="Numer, tytuł lub adres…"
            value={filters.search}
            onChangeText={(search) => setFilters({ ...filters, search })}
          />
          <WorkControls value={filters} view={view} onChange={setFilters} />
          <View style={{ gap: 4 }} accessibilityLiveRegion="polite">
            <Copy weight="600" size={14}>
              {view === 'active'
                ? 'Niezakończone sprawy'
                : view === 'archive'
                  ? 'Zakończone sprawy'
                  : 'Wszystkie statusy'}{' '}
              · {filtered.length}
            </Copy>
            {filters.search.trim() && (
              <Copy muted size={13}>
                Wyniki dla „{filters.search.trim()}” w wybranym zakresie dat i filtrów.
              </Copy>
            )}
            {!filtered.length && (
              <Copy muted size={13}>
                Zmień daty, wyszukiwane hasło lub pozostałe filtry.
              </Copy>
            )}
          </View>
        </View>
      }
    />
  );
}
