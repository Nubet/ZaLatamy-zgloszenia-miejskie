import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { distance } from '@turf/distance';
import { lodzBoundary } from './boundary';
import {
  localResidentId,
  type Category,
  type Location,
  type Report,
  type ReportUpdate,
  type Status,
} from './model';

export function primaryReport(report: Report, reports: Report[]): Report {
  const byId = new Map(reports.map((item) => [item.id, item]));
  const visited = new Set<string>();
  let current = report;
  while (current.duplicateOf) {
    if (visited.has(current.id)) throw new Error('Wykryto cykl połączonych zgłoszeń.');
    visited.add(current.id);
    const next = byId.get(current.duplicateOf);
    if (!next) throw new Error('Nie znaleziono sprawy nadrzędnej.');
    current = next;
  }
  return current;
}
export function relatedReports(report: Report, reports: Report[]) {
  const id = primaryReport(report, reports).id;
  return reports.filter((item) => primaryReport(item, reports).id === id);
}
export function reportSupport(report: Report, reports: Report[]) {
  const related = relatedReports(report, reports);
  const people = new Set(related.flatMap((item) => [item.authorId, ...item.confirmations]));
  return {
    count: people.size,
    confirmed: people.has(localResidentId),
    authored: related.some((item) => item.authorId === localResidentId),
  };
}
export function acceptsConfirmations(report: Report) {
  return ['new', 'accepted', 'progress'].includes(report.status);
}
export function isWithinLodz(point: Location) {
  return (
    Number.isFinite(point.longitude) &&
    Number.isFinite(point.latitude) &&
    booleanPointInPolygon([point.longitude, point.latitude], lodzBoundary)
  );
}
export function nearbyReports(reports: Report[], category: Category, location: Location) {
  return reports
    .filter((item) => item.category === category && acceptsConfirmations(item) && !item.duplicateOf)
    .map((report) => ({
      report,
      meters: distance(
        [location.longitude, location.latitude],
        [report.location.longitude, report.location.latitude],
        { units: 'meters' },
      ),
    }))
    .filter((item) => item.meters <= 100)
    .sort((a, b) => a.meters - b.meters);
}
export function requiresUpdateComment(status: Status) {
  return status === 'rejected' || status === 'duplicate';
}
export function validateUpdate(report: Report, update: ReportUpdate, reports: Report[]) {
  if (requiresUpdateComment(update.status) && update.comment.trim().length < 5)
    throw new Error('Dodaj uzasadnienie (minimum 5 znaków).');
  if (update.status !== 'duplicate') return;
  const target = reports.find((item) => item.id === update.duplicateOf);
  if (!target || target.id === report.id) throw new Error('Wybierz inne istniejące zgłoszenie.');
  const simulated = reports.map((item) =>
    item.id === report.id ? { ...item, duplicateOf: target.id } : item,
  );
  primaryReport({ ...report, duplicateOf: target.id }, simulated);
  if (report.duplicateOf !== target.id && !acceptsConfirmations(primaryReport(target, reports)))
    throw new Error('Wybierz aktywną sprawę nadrzędną.');
}
