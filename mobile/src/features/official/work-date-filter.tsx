import { useState } from 'react';
import { Button, Choice, Copy, Field, Notice } from '@/shared/ui/primitives';
import { dateError, type WorkFilters, type WorkView } from './work-queue';

export const dateOptions = {
  all: 'Bez ograniczenia daty',
  '7': 'Ostatnie 7 dni',
  '30': 'Ostatnie 30 dni',
  '90': 'Ostatnie 90 dni',
  month: 'Bieżący miesiąc',
  custom: 'Własny zakres',
} satisfies Record<WorkFilters['days'], string>;

export function WorkDateFilter({
  value,
  view,
  onChange,
}: {
  value: WorkFilters;
  view: WorkView;
  onChange: (update: Pick<WorkFilters, 'days' | 'from' | 'to'>) => void;
}) {
  const [custom, setCustom] = useState(value.days === 'custom');
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const error = dateError({ ...value, days: 'custom', from, to });
  return (
    <>
      <Copy muted>Zakres dotyczy daty utworzenia zgłoszenia, nie ostatniej aktualizacji.</Copy>
      {(['all', '7', '30', '90', 'month', 'custom'] as const)
        .filter((days) => days !== 'all' || view !== 'archive')
        .map((days) => (
          <Choice
            key={days}
            label={dateOptions[days]}
            selected={days === 'custom' ? custom : !custom && value.days === days}
            onPress={() =>
              days === 'custom' ? setCustom(true) : onChange({ days, from: '', to: '' })
            }
          />
        ))}
      {custom && (
        <>
          <Field
            label="Data zgłoszenia od"
            hint="Format RRRR-MM-DD, np. 2026-10-01"
            placeholder="RRRR-MM-DD"
            value={from}
            maxLength={10}
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            onChangeText={setFrom}
          />
          <Field
            label="Data zgłoszenia do"
            hint="Format RRRR-MM-DD, np. 2026-10-31"
            placeholder="RRRR-MM-DD"
            value={to}
            maxLength={10}
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            onChangeText={setTo}
          />
          <Notice error message={error} />
          <Button
            label="Zastosuj zakres"
            disabled={!from || !to || !!error}
            onPress={() => onChange({ days: 'custom', from, to })}
          />
        </>
      )}
    </>
  );
}
