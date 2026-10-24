import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLocalGateway } from './gateway';
import { emptyDraft } from '../../domain/reports/model';

function fixture() {
  let value: string | null = null;
  let fails = false;
  let sequence = 0;
  const gateway = createLocalGateway(
    {
      read: async () => value,
      write: async (next) => {
        if (fails) throw new Error('disk full');
        value = next;
      },
    },
    { exists: () => true, remove: () => {}, removeUnused: () => {} },
    () => `${String(++sequence).padStart(8, '0')}-test`,
  );
  return {
    gateway,
    fail: (next: boolean) => {
      fails = next;
    },
  };
}
test('create commits saved photos and clears the draft together', async () => {
  const { gateway } = fixture();
  await gateway.saveDraft({
    ...emptyDraft(),
    photos: [{ id: 'demo', uri: 'demo:road', kind: 'demo', mime: 'image/svg+xml', size: 0 }],
  });
  const report = await gateway.create({
    title: 'Nowa dziura',
    description: 'Duża dziura w chodniku przy wejściu.',
    category: 'road',
    location: { longitude: 19.456, latitude: 51.7592 },
    address: 'Łódź, centrum',
  });
  assert.equal((await gateway.load()).draft, null);
  await assert.rejects(gateway.create(report));
  assert.equal((await gateway.load()).reports.length, 13);
});
test('serialized changes retain history, notifications and independent mutations', async () => {
  const { gateway } = fixture();
  await Promise.all([
    gateway.update('LDZ-1045', {
      status: 'accepted',
      priority: 'high',
      comment: 'Przyjęto sprawę.',
      duplicateOf: null,
    }),
    gateway.watch('LDZ-1043'),
  ]);
  const state = await gateway.load();
  assert.equal(state.reports.find((item) => item.id === 'LDZ-1045')!.status, 'accepted');
  assert.equal(state.reports.find((item) => item.id === 'LDZ-1043')!.watching, true);
  assert.equal(state.notifications.length, 2);
});
test('failed writes preserve persisted data and do not poison the queue', async () => {
  const { gateway, fail } = fixture();
  await gateway.load();
  fail(true);
  await assert.rejects(
    gateway.update('LDZ-1045', {
      status: 'resolved',
      priority: 'normal',
      comment: '',
      duplicateOf: null,
    }),
  );
  fail(false);
  assert.equal(
    (await gateway.load()).reports.find((item) => item.id === 'LDZ-1045')!.status,
    'new',
  );
  await gateway.watch('LDZ-1043');
  assert.equal(
    (await gateway.load()).reports.find((item) => item.id === 'LDZ-1043')!.watching,
    true,
  );
});

test('resident and official share a complete lifecycle, including reset', async () => {
  const { gateway } = fixture();
  await gateway.saveDraft({
    ...emptyDraft(),
    photos: [{ id: 'demo', uri: 'demo:road', kind: 'demo', mime: 'image/svg+xml', size: 0 }],
  });
  const report = await gateway.create({
    title: 'Nowy problem',
    description: 'Uszkodzony chodnik w okolicy wejścia.',
    category: 'road',
    location: { longitude: 19.456, latitude: 51.7592 },
    address: 'Łódź, centrum',
  });
  await gateway.update(report.id, {
    status: 'accepted',
    priority: 'high',
    comment: 'Przyjęto do realizacji.',
    duplicateOf: null,
  });
  const state = await gateway.load();
  assert.equal(state.reports.find((item) => item.id === report.id)!.history.length, 2);
  const notification = state.notifications.find((item) => item.reportId === report.id)!;
  assert.equal(notification.read, false);
  await gateway.markRead([notification.id]);
  assert.equal(
    (await gateway.load()).notifications.find((item) => item.id === notification.id)!.read,
    true,
  );
  await gateway.reset();
  assert.equal(
    (await gateway.load()).reports.some((item) => item.id === report.id),
    false,
  );
});

test('linking preserves materials and routes confirmation and watching to the group', async () => {
  const { gateway } = fixture();
  const before = await gateway.load();
  const photos = before.reports.find((item) => item.id === 'LDZ-1043')!.photos;
  await gateway.update('LDZ-1043', {
    status: 'duplicate',
    priority: 'normal',
    comment: 'Dotyczy tego samego problemu.',
    duplicateOf: 'LDZ-1044',
  });
  assert.equal(await gateway.setConfirmation('LDZ-1043', true), 'LDZ-1044');
  await gateway.watch('LDZ-1043');
  const state = await gateway.load();
  assert.deepEqual(state.reports.find((item) => item.id === 'LDZ-1043')!.photos, photos);
  assert.equal(
    state.reports.find((item) => item.id === 'LDZ-1044')!.confirmations.includes('resident:local'),
    true,
  );
  assert.equal(state.reports.find((item) => item.id === 'LDZ-1044')!.watching, false);
  assert.equal(state.reports.find((item) => item.id === 'LDZ-1043')!.watching, false);
});

test('a failed draft removal does not delete its referenced files', async () => {
  let raw: string | null = null;
  let fail = false;
  const removed: string[] = [];
  const gateway = createLocalGateway(
    {
      read: async () => raw,
      write: async (value) => {
        if (fail) throw new Error('disk full');
        raw = value;
      },
    },
    { exists: () => true, remove: (uri) => removed.push(uri), removeUnused: () => {} },
    () => 'test-id',
  );
  const photo = {
    id: 'photo',
    uri: 'file:///photos/photo.jpg',
    kind: 'file' as const,
    mime: 'image/jpeg',
    size: 1024,
  };
  await gateway.saveDraft({ ...emptyDraft(), photos: [photo] });
  fail = true;
  await assert.rejects(gateway.saveDraft(null));
  assert.deepEqual(removed, []);
  assert.equal((await gateway.load()).draft!.photos[0]!.id, photo.id);
  fail = false;
  await gateway.saveDraft(null);
  assert.deepEqual(removed, [photo.uri]);
});
