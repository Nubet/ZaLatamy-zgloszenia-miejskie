import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../../infrastructure/mock/seed';
import { dateError, defaultFilters, filterWorkReports } from './work-queue';

test('queues split active and closed reports and rank urgency before age', () => {
  const { reports } = createSeed();
  const active = filterWorkReports(reports, 'active', defaultFilters('active'));
  const archive = filterWorkReports(reports, 'archive', defaultFilters('archive'));
  assert.equal(active.length + archive.length, reports.length);
  assert.equal(active[0]!.priority, 'high');
  assert.ok(archive.some((item) => item.status === 'duplicate'));
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
