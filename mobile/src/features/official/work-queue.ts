import type { Category, Priority, Report, Status } from '@/domain/reports/model';
import { reportSupport } from '@/domain/reports/rules';

export type WorkView = 'active' | 'all' | 'archive';
export type WorkFilters = {
  search: string;
  category: Category | '';
  status: Status | '';
  priority: Priority | '';
  sort: 'priority' | 'confirmations' | 'newest' | 'oldest';
  days: 'all' | '7' | '30' | '90' | 'month' | 'custom';
  from: string;
  to: string;
};
export function defaultFilters(view: WorkView): WorkFilters {
  return {
    search: '',
    category: '',
    status: '',
    priority: '',
    sort: view === 'active' ? 'priority' : 'newest',
    days: view === 'active' ? 'all' : view === 'archive' ? '90' : '30',
    from: '',
    to: '',
  };
}
export function viewStatuses(view: WorkView): Status[] {
  return view === 'active'
    ? ['new', 'accepted', 'progress']
    : view === 'archive'
      ? ['resolved', 'rejected', 'duplicate']
      : ['new', 'accepted', 'progress', 'resolved', 'rejected', 'duplicate'];
}
const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
export function dateError(filters: WorkFilters) {
  if (filters.days !== 'custom') return '';
  for (const date of [filters.from, filters.to])
    if (
      date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date)
    )
      return 'Podaj poprawną datę w formacie RRRR-MM-DD.';
  if (filters.from && filters.to && filters.from > filters.to)
    return 'Data końcowa nie może poprzedzać początkowej.';
  return '';
}
export function filterWorkReports(
  reports: Report[],
  view: WorkView,
  filters: WorkFilters,
  now = new Date(),
) {
  if (dateError(filters)) return [];
  const allowed = viewStatuses(view);
  const today = dayFormat.format(now);
  const cutoff =
    filters.days === 'month'
      ? `${today.slice(0, 7)}-01`
      : filters.days === '7' || filters.days === '30' || filters.days === '90'
        ? new Date(Date.parse(`${today}T12:00:00Z`) - (Number(filters.days) - 1) * 86400000)
            .toISOString()
            .slice(0, 10)
        : '';
  const search = filters.search.trim().toLocaleLowerCase('pl');
  const rank = { high: 0, normal: 1, low: 2 };
  return reports
    .filter((report) => {
      const day = dayFormat.format(new Date(report.createdAt));
      return (
        allowed.includes(report.status) &&
        (!filters.status || report.status === filters.status) &&
        (!filters.category || report.category === filters.category) &&
        (!filters.priority || report.priority === filters.priority) &&
        `${report.title} ${report.id} ${report.address}`.toLocaleLowerCase('pl').includes(search) &&
        (!cutoff || (day >= cutoff && day <= today)) &&
        (filters.days !== 'custom' ||
          ((!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)))
      );
    })
    .sort((a, b) => {
      const oldest = Date.parse(a.createdAt) - Date.parse(b.createdAt);
      return filters.sort === 'priority'
        ? rank[a.priority] - rank[b.priority] || oldest
        : filters.sort === 'confirmations'
          ? reportSupport(b, reports).count - reportSupport(a, reports).count || oldest
          : filters.sort === 'oldest'
            ? oldest
            : -oldest;
    });
}
