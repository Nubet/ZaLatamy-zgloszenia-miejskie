import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  categories,
  statuses,
  type Category,
  type DemoState,
  type Status,
} from '@/domain/reports/model';
import { useTheme } from '@/shared/theme/provider';
import { Button, Choice, Copy, Field, Screen, Sheet } from '@/shared/ui/primitives';
import CityMap from '@/features/map/city-map';
import { ReportsBoundary } from '@/features/report-details/reports-boundary';
import { ReportCard } from '@/features/report-details/report-ui';
import { ReportList } from '@/features/report-details/report-list';

export function Explorer() {
  return <ReportsBoundary>{(state) => <ExplorerContent state={state} />}</ReportsBoundary>;
}
function ExplorerContent({ state }: { state: DemoState }) {
  const { name, colors } = useTheme();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [status, setStatus] = useState<Status | ''>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [cutoff] = useState(() => Date.now() - 30 * 86400000);
  const reports = state.reports.filter(
    (report) =>
      Date.parse(report.createdAt) >= cutoff &&
      (!category || report.category === category) &&
      (!status || report.status === status) &&
      (status === 'duplicate' || !report.duplicateOf) &&
      `${report.title} ${report.id} ${report.address}`
        .toLocaleLowerCase('pl')
        .includes(search.trim().toLocaleLowerCase('pl')),
  );
  const selected = reports.find((report) => report.id === selectedId);
  const open = (id: string) => router.push({ pathname: '/resident/reports/[id]', params: { id } });
  const header = (
    <View style={{ gap: 10 }}>
      <Field
        label="Szukaj w okolicy"
        placeholder="Ulica, problem lub numer…"
        value={search}
        onChangeText={setSearch}
      />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Choice label="Mapa" selected={view === 'map'} onPress={() => setView('map')} />
        <Choice
          label={`Lista (${reports.length})`}
          selected={view === 'list'}
          onPress={() => setView('list')}
        />
        <Choice
          label={`Filtry${category || status ? ' ●' : ''}`}
          selected={filtersOpen}
          onPress={() => setFiltersOpen(!filtersOpen)}
        />
      </View>
      <Sheet title="Filtry" visible={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Copy size={13} weight="600">
          Kategoria
        </Copy>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Choice label="Wszystkie" selected={!category} onPress={() => setCategory('')} />
          {Object.entries(categories).map(([key, label]) => (
            <Choice
              key={key}
              label={label}
              selected={category === key}
              onPress={() => setCategory(key as Category)}
            />
          ))}
        </View>
        <Copy size={13} weight="600">
          Status
        </Copy>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Choice label="Wszystkie" selected={!status} onPress={() => setStatus('')} />
          {Object.entries(statuses).map(([key, label]) => (
            <Choice
              key={key}
              label={label}
              selected={status === key}
              onPress={() => setStatus(key as Status)}
            />
          ))}
        </View>
        <Button
          label="Wyczyść filtry"
          variant="secondary"
          onPress={() => {
            setCategory('');
            setStatus('');
            setSearch('');
          }}
        />
      </Sheet>
      <Copy muted size={12}>
        Łódź · ostatnie 30 dni
      </Copy>
    </View>
  );
  if (view === 'list')
    return (
      <ReportList reports={reports} allReports={state.reports} header={header} onOpen={open} />
    );
  return (
    <Screen scroll={false}>
      {header}
      <View
        style={{
          flex: 1,
          minHeight: 160,
          borderRadius: 14,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <CityMap
          theme={name}
          points={reports.map((report) => ({
            id: report.id,
            title: report.title,
            ...report.location,
            color: colors[report.status],
          }))}
          selectedId={selectedId}
          onSelect={async (id) => setSelectedId(id)}
          dom={{ style: { flex: 1 }, scrollEnabled: false, useExpoDOMWebView: false }}
        />
        {selected && (
          <View style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
            <ReportCard
              report={selected}
              reports={state.reports}
              onPress={() => open(selected.id)}
            />
          </View>
        )}
      </View>
      {!reports.length && (
        <Copy muted size={13}>
          Brak zgłoszeń spełniających kryteria.
        </Copy>
      )}
    </Screen>
  );
}
