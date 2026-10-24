import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../../infrastructure/mock/seed';
import { dateError, defaultFilters, filterWorkReports } from './work-queue';

test('queues split active and closed reports and rank urgency before age', () => {
  const { reports } = createSeed();
  const originalOrder = reports.map((report) => report.id);
  Object.freeze(reports);
  const active = filterWorkReports(reports, 'active', defaultFilters('active'));
  const archive = filterWorkReports(reports, 'archive', defaultFilters('archive'));
  assert.equal(active.length + archive.length, reports.length);
  assert.equal(active[0]!.priority, 'high');
  assert.ok(archive.some((item) => item.status === 'duplicate'));
  assert.deepEqual(
    reports.map((report) => report.id),
    originalOrder,
  );
});
test('custom dates reject invalid days and apply inclusive Warsaw dates', () => {
  const filters = { ...defaultFilters('all'), days: 'custom' as const, from: '2026-02-30' };
  assert.notEqual(dateError(filters), '');
  const { reports } = createSeed(new Date('2026-10-24T12:00:00Z'));
  assert.equal(
    filterWorkReports(reports, 'all', { ...filters, from: '2026-10-23', to: '2026-10-23' }).length,
    1,
  );
});

test('date presets use Warsaw calendar days across DST and exclude future dates', () => {
  const now = new Date('2026-10-26T00:30:00+01:00');
  const template = createSeed(now).reports[0]!;
  const reports = [
    '2026-09-30',
    '2026-10-01',
    '2026-10-19',
    '2026-10-20',
    '2026-10-26',
    '2026-10-27',
  ].map((day) => ({
    ...template,
    id: day,
    createdAt: `${day}T12:00:00+01:00`,
  }));
  const filters = { ...defaultFilters('all'), sort: 'oldest' as const };
  const ids = (days: typeof filters.days) =>
    filterWorkReports(reports, 'all', { ...filters, days }, now).map((report) => report.id);
  assert.deepEqual(ids('7'), ['2026-10-20', '2026-10-26']);
  assert.deepEqual(ids('month'), ['2026-10-01', '2026-10-19', '2026-10-20', '2026-10-26']);
  assert.deepEqual(ids('30'), [
    '2026-09-30',
    '2026-10-01',
    '2026-10-19',
    '2026-10-20',
    '2026-10-26',
  ]);
  assert.equal(ids('all').length, reports.length);
});

test('search, category, status, priority and dates compose independently of sorting', () => {
  const now = new Date('2026-10-24T12:00:00Z');
  const template = createSeed(now).reports[0]!;
  const reports = [
    {
      ...template,
      id: 'first',
      title: 'Dziura przy szkole',
      status: 'new' as const,
      priority: 'high' as const,
      createdAt: '2026-10-22T12:00:00Z',
    },
    {
      ...template,
      id: 'second',
      title: 'Dziura przy szkole',
      status: 'new' as const,
      priority: 'high' as const,
      createdAt: '2026-10-23T12:00:00Z',
    },
    {
      ...template,
      id: 'other',
      title: 'Dziura przy szkole',
      status: 'resolved' as const,
      priority: 'low' as const,
      createdAt: '2026-10-23T12:00:00Z',
    },
  ];
  const filters = {
    ...defaultFilters('all'),
    search: 'SZKOLE',
    category: template.category,
    status: 'new' as const,
    priority: 'high' as const,
    days: 'custom' as const,
    from: '2026-10-22',
    to: '2026-10-23',
  };
  assert.deepEqual(
    filterWorkReports(reports, 'all', filters, now).map((report) => report.id),
    ['second', 'first'],
  );
  assert.deepEqual(
    filterWorkReports(reports, 'all', { ...filters, sort: 'oldest' }, now).map(
      (report) => report.id,
    ),
    ['first', 'second'],
  );
  assert.equal(filterWorkReports(reports, 'all', { ...filters, priority: 'low' }, now).length, 0);
});
