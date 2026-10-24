import { View } from 'react-native';
import { useReportMutation } from '@/application/reports/provider';
import type { Report } from '@/domain/reports/model';
import { acceptsConfirmations, primaryReport, relatedReports, reportSupport } from '@/domain/reports/rules';
import { Button, Card, Copy, Notice } from '@/shared/ui/primitives';

export function ResidentActions({ report, reports }: { report: Report; reports: Report[] }) {
  const confirmation = useReportMutation<boolean, string>((gateway, confirmed) => gateway.setConfirmation(report.id, confirmed));
  const watch = useReportMutation((gateway) => gateway.watch(report.id));
  const primary = primaryReport(report, reports);
  const support = reportSupport(report, reports);
  const watching = relatedReports(report, reports).some(item => item.watching);
  const active = acceptsConfirmations(primary);
  const busy = confirmation.isPending || watch.isPending;
  return <Card><Copy weight="600">Też widzisz ten problem?</Copy><Copy muted size={13}>{support.count} osób potwierdza. Jedna osoba jest liczona raz, również po połączeniu spraw.</Copy><View style={{ gap: 10 }}><Button label={support.authored ? 'Twoje zgłoszenie już się liczy' : !active ? 'Sprawa zakończona' : support.confirmed ? 'Potwierdzono · cofnij' : 'Potwierdzam problem'} variant={support.confirmed ? 'secondary' : 'primary'} disabled={busy || support.authored || !active} pending={confirmation.isPending} onPress={() => confirmation.mutate(!support.confirmed)} /><Button label={watching ? 'Przestań obserwować' : 'Obserwuj sprawę'} variant="secondary" disabled={busy} pending={watch.isPending} onPress={() => watch.mutate()} /></View><Copy muted size={12}>Obserwacja zapisuje aktualizacje w lokalnej skrzynce. To nie są powiadomienia systemowe.</Copy><Notice error message={confirmation.error?.message || watch.error?.message} /></Card>;
}
