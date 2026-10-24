import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../../infrastructure/mock/seed';
import { stateSchema } from './model';
import { isWithinLodz, nearbyReports, primaryReport, reportSupport, validateUpdate } from './rules';

test('seed stays valid and recent, with an intact linked group', () => {
  const state = stateSchema.parse(createSeed());
  const linked = state.reports.at(-1)!;
  assert.equal(primaryReport(linked, state.reports).id, 'LDZ-1045');
  assert.ok(state.reports.every((item) => isWithinLodz(item.location)));
});
test('support counts each author and resident once across linked reports', () => {
  const state = createSeed();
  const report = state.reports[3]!;
  report.confirmations.push(report.authorId);
  assert.equal(reportSupport(report, state.reports).count, 4);
  assert.equal(reportSupport(report, state.reports).authored, true);
});
test('rejects cyclic linking and missing rejection reasons', () => {
  const { reports } = createSeed();
  assert.throws(() =>
    validateUpdate(
      reports[3]!,
      {
        status: 'duplicate',
        priority: 'normal',
        comment: 'Ta sama sprawa',
        duplicateOf: reports.at(-1)!.id,
      },
      reports,
    ),
  );
  assert.throws(() =>
    validateUpdate(
      reports[0]!,
      { status: 'rejected', priority: 'normal', comment: '', duplicateOf: null },
      reports,
    ),
  );
});
test('nearby matches only active primary reports in the same category', () => {
  const { reports } = createSeed();
  const report = reports[3]!;
  assert.deepEqual(
    nearbyReports(reports, 'road', report.location).map((item) => item.report.id),
    [report.id],
  );
  assert.equal(isWithinLodz({ longitude: 21, latitude: 52 }), false);
});
