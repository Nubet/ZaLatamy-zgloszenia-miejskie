import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalGateway } from './gateway';
import { emptyDraft } from '../../domain/reports/model';

function fixture() {
  let value: string | null = null;
  let fails = false;
  let sequence = 0;
  const gateway = createLocalGateway({ read: async () => value, write: async next => { if (fails) throw new Error('disk full'); value = next; } }, { exists: () => true, remove: () => {} }, () => `${String(++sequence).padStart(8, '0')}-test`);
  return { gateway, fail: (next: boolean) => { fails = next; } };
}
test('create commits saved photos and clears the draft together', async () => {
  const { gateway } = fixture();
  await gateway.saveDraft({ ...emptyDraft(), photos: [{ id: 'demo', uri: 'demo:road', kind: 'demo', mime: 'image/svg+xml', size: 0 }] });
  const report = await gateway.create({ title: 'Nowa dziura', description: 'Duża dziura w chodniku przy wejściu.', category: 'road', location: { longitude: 19.456, latitude: 51.7592 }, address: 'Łódź, centrum' });
  assert.equal((await gateway.load()).draft, null);
  await assert.rejects(gateway.create(report));
  assert.equal((await gateway.load()).reports.length, 13);
});
test('serialized changes retain history, notifications and independent mutations', async () => {
  const { gateway } = fixture();
  await Promise.all([
    gateway.update('LDZ-1045', { status: 'accepted', priority: 'high', comment: 'Przyjęto sprawę.', duplicateOf: null }),
    gateway.watch('LDZ-1043'),
  ]);
  const state = await gateway.load();
  assert.equal(state.reports.find(item => item.id === 'LDZ-1045')!.status, 'accepted');
  assert.equal(state.reports.find(item => item.id === 'LDZ-1043')!.watching, true);
  assert.equal(state.notifications.length, 2);
});
test('failed writes preserve persisted data and do not poison the queue', async () => {
  const { gateway, fail } = fixture();
  await gateway.load();
  fail(true);
  await assert.rejects(gateway.update('LDZ-1045', { status: 'resolved', priority: 'normal', comment: '', duplicateOf: null }));
  fail(false);
  assert.equal((await gateway.load()).reports.find(item => item.id === 'LDZ-1045')!.status, 'new');
  await gateway.watch('LDZ-1043');
  assert.equal((await gateway.load()).reports.find(item => item.id === 'LDZ-1043')!.watching, true);
});
