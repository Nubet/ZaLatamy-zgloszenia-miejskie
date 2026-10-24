import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import type { DemoState } from '@/domain/reports/model';
import { Choice, Copy, Field, Heading } from '@/shared/ui/primitives';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { ReportList } from '@/features/report-details/report-list';
import { defaultFilters, filterWorkReports, type WorkView } from './work-queue';
import { WorkFilters } from './work-filters';

export function WorkScreen({ view }: { view: WorkView }) { return <ReportsBoundary>{state => <Queue key={view} view={view} state={state} />}</ReportsBoundary>; }
function Queue({ view, state }: { view: WorkView; state: DemoState }) {
  const [filters, setFilters] = useState(() => defaultFilters(view));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = filterWorkReports(state.reports, view, filters);
  const title = view === 'active' ? 'Sprawy czekają\nna Twój ruch.' : view === 'archive' ? 'Zamknięte sprawy.' : 'Pełny obraz miasta.';
  return <ReportList reports={filtered} allReports={state.reports} onOpen={id => router.push({ pathname: '/official/reports/[id]', params: { id } })} header={<View style={{ gap: 16, marginBottom: 6 }}><Heading eyebrow={`Urząd Miasta Łodzi · ${view === 'active' ? 'Do obsługi' : view === 'archive' ? 'Archiwum' : 'Wszystkie'}`} title={title} description="Obsługa demonstracyjna. Zmiany zobaczy również mieszkaniec na tym urządzeniu." /><Field label="Szukaj sprawy" placeholder="Numer, tytuł lub adres…" value={filters.search} onChangeText={search => setFilters({ ...filters, search })} /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Choice label="Filtry i sortowanie" selected={filtersOpen} onPress={() => setFiltersOpen(!filtersOpen)} /><Copy muted size={13}>{filtered.length} spraw</Copy></View>{filtersOpen && <WorkFilters value={filters} view={view} onChange={setFilters} />}</View>} />;
}
