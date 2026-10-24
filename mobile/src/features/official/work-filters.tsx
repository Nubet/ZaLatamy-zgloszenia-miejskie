import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import {
  ArrowDownWideNarrow,
  CalendarDays,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import { categories, priorities, statuses } from '@/domain/reports/model';
import { useTheme } from '@/shared/theme/provider';
import { Button, Card, Choice, Copy, Sheet } from '@/shared/ui/primitives';
import { defaultFilters, viewStatuses, type WorkFilters, type WorkView } from './work-queue';
import { WorkDateFilter, dateOptions } from './work-date-filter';

const sortOptions = {
  priority: 'Pilne najpierw',
  confirmations: 'Najwięcej potwierdzeń',
  oldest: 'Najstarsze',
  newest: 'Najnowsze',
} satisfies Record<WorkFilters['sort'], string>;

type Panel = 'filters' | 'sort' | 'dates';
const panelTitles = { filters: 'Filtry', sort: 'Sortuj według', dates: 'Data zgłoszenia' };

export function WorkControls({
  value,
  view,
  onChange,
}: {
  value: WorkFilters;
  view: WorkView;
  onChange: (value: WorkFilters) => void;
}) {
  const { colors } = useTheme();
  const [panel, setPanel] = useState<Panel | null>(null);
  const change = (update: Partial<WorkFilters>) => onChange({ ...value, ...update });
  const filterCount = [value.status, value.category, value.priority].filter(Boolean).length;
  const activeFilters = [
    { key: 'status', label: 'Status', value: value.status && statuses[value.status] },
    { key: 'category', label: 'Kategoria', value: value.category && categories[value.category] },
    { key: 'priority', label: 'Priorytet', value: value.priority && priorities[value.priority] },
  ] as const;
  const dateLabel =
    value.days === 'custom'
      ? `${value.from || 'Początek'} – ${value.to || 'Dzisiaj'}`
      : dateOptions[value.days];
  const defaults = defaultFilters(view);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row' }}>
        <Control
          label="Data zgłoszenia"
          value={dateLabel}
          icon={<CalendarDays size={18} color={colors.muted} />}
          onPress={() => setPanel('dates')}
        />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Control
          label="Filtry"
          value={filterCount ? `Aktywne: ${filterCount}` : 'Wszystkie w tym widoku'}
          active={filterCount > 0}
          icon={<SlidersHorizontal size={18} color={colors.muted} />}
          onPress={() => setPanel('filters')}
        />
        <Control
          label="Sortuj według"
          value={sortOptions[value.sort]}
          icon={<ArrowDownWideNarrow size={18} color={colors.muted} />}
          onPress={() => setPanel('sort')}
        />
      </View>
      {filterCount > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {activeFilters
            .filter((filter) => filter.value)
            .map((filter) => (
              <Pressable
                key={filter.key}
                accessibilityRole="button"
                accessibilityLabel={`Usuń filtr ${filter.label.toLocaleLowerCase('pl')}: ${filter.value}`}
                onPress={() => change({ [filter.key]: '' })}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  minHeight: 44,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: colors.selected,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Copy size={13}>
                  {filter.label}: {filter.value}
                </Copy>
                <X size={14} color={colors.accentText} />
              </Pressable>
            ))}
        </View>
      )}
      <Sheet
        title={panel ? panelTitles[panel] : ''}
        visible={panel !== null}
        onClose={() => setPanel(null)}
      >
        {panel === 'filters' && (
          <>
            <Copy muted>
              Wybierz status, kategorię i priorytet. Daty i sortowanie ustawisz osobno.
            </Copy>
            <Card>
              <Copy weight="600">Status</Copy>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Choice
                  label="Wszystkie w tym widoku"
                  selected={!value.status}
                  onPress={() => change({ status: '' })}
                />
                {viewStatuses(view).map((status) => (
                  <Choice
                    key={status}
                    label={statuses[status]}
                    selected={value.status === status}
                    onPress={() => change({ status })}
                  />
                ))}
              </View>
              <Copy weight="600">Kategoria</Copy>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Choice
                  label="Wszystkie kategorie"
                  selected={!value.category}
                  onPress={() => change({ category: '' })}
                />
                {Object.entries(categories).map(([key, label]) => (
                  <Choice
                    key={key}
                    label={label}
                    selected={value.category === key}
                    onPress={() => change({ category: key as WorkFilters['category'] })}
                  />
                ))}
              </View>
              <Copy weight="600">Priorytet</Copy>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Choice
                  label="Każdy priorytet"
                  selected={!value.priority}
                  onPress={() => change({ priority: '' })}
                />
                {Object.entries(priorities).map(([key, label]) => (
                  <Choice
                    key={key}
                    label={label}
                    selected={value.priority === key}
                    onPress={() => change({ priority: key as WorkFilters['priority'] })}
                  />
                ))}
              </View>
            </Card>
            <Button
              label="Wyczyść filtry"
              variant="secondary"
              disabled={!filterCount}
              onPress={() => change({ status: '', category: '', priority: '' })}
            />
          </>
        )}
        {panel === 'sort' &&
          Object.entries(sortOptions).map(([sort, label]) => (
            <Choice
              key={sort}
              label={label}
              selected={value.sort === sort}
              onPress={() => {
                change({ sort: sort as WorkFilters['sort'] });
                setPanel(null);
              }}
            />
          ))}
        {panel === 'dates' && (
          <WorkDateFilter
            value={value}
            view={view}
            onChange={(update) => {
              change(update);
              setPanel(null);
            }}
          />
        )}
      </Sheet>
      {JSON.stringify(value) !== JSON.stringify(defaults) && (
        <Button label="Przywróć domyślny widok" variant="text" onPress={() => onChange(defaults)} />
      )}
    </View>
  );
}

function Control({
  label,
  value,
  icon,
  active = false,
  onPress,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  active?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityHint="Otwiera opcje wyboru"
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: 140,
        flexShrink: 1,
        padding: 12,
        gap: 6,
        minHeight: 76,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? colors.accentText : colors.border,
        backgroundColor: active ? colors.selected : colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <View style={{ flex: 1 }}>
          <Copy muted size={12}>
            {label}
          </Copy>
        </View>
        <ChevronDown size={14} color={colors.muted} />
      </View>
      <Copy size={14} weight="600">
        {value}
      </Copy>
    </Pressable>
  );
}
