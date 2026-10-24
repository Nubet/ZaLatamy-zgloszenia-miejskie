import { draftSchema, localResidentId, savedDraftSchema, stateSchema, statuses, updateSchema, type DemoState, type Report } from '@/domain/reports/model';
import { acceptsConfirmations, isWithinLodz, primaryReport, relatedReports, validateUpdate } from '@/domain/reports/rules';
import type { PhotoFiles, ReportsGateway, StateStorage } from '@/application/reports/port';
import { createSeed } from '../mock/seed';

export function createLocalGateway(storage: StateStorage, files: PhotoFiles, id: () => string): ReportsGateway {
  let queue: Promise<unknown> = Promise.resolve();
  function serialized<T>(action: () => Promise<T>): Promise<T> {
    const next = queue.then(action);
    queue = next.catch(() => undefined);
    return next;
  }
  const photos = (state: DemoState) => [...state.reports.flatMap(item => item.photos), ...(state.draft?.photos ?? [])].filter(item => item.kind === 'file');
  async function read() {
    const raw = await storage.read();
    if (raw === null) {
      const seed = createSeed();
      await storage.write(JSON.stringify(seed));
      return seed;
    }
    try { return stateSchema.parse(JSON.parse(raw)); }
    catch { throw new Error('Nie można odczytać danych demo. Spróbuj ponownie lub jawnie przywróć dane początkowe.'); }
  }
  async function write(next: DemoState, previous: DemoState) {
    await storage.write(JSON.stringify(stateSchema.parse(next)));
    const retained = new Set(photos(next).map(item => item.uri));
    for (const photo of photos(previous)) if (!retained.has(photo.uri)) {
      try { files.remove(photo.uri); } catch { /* Metadata is committed; unused files can be removed at the next reset. */ }
    }
  }
  function transaction<T>(action: (state: DemoState) => T | Promise<T>) {
    return serialized(async () => {
      const state = await read();
      const previous = structuredClone(state);
      const result = await action(state);
      await write(state, previous);
      return result;
    });
  }
  function find(state: DemoState, reportId: string) {
    const report = state.reports.find(item => item.id === reportId);
    if (!report) throw new Error('Nie znaleziono zgłoszenia.');
    return report;
  }
  return {
    load: () => serialized(read),
    create: input => transaction(state => {
      const draft = draftSchema.parse(input);
      if (!isWithinLodz(draft.location)) throw new Error('Wybierz miejsce w granicach Łodzi.');
      const attachments = state.draft?.photos ?? [];
      if (!attachments.length) throw new Error('Dodaj przynajmniej jedno zdjęcie.');
      if (attachments.some(photo => photo.kind === 'file' && !files.exists(photo.uri))) throw new Error('Brakuje pliku zdjęcia. Dodaj je ponownie.');
      const reportId = `LDZ-${id().slice(0, 8).toUpperCase()}`;
      const at = new Date().toISOString();
      const report: Report = { ...draft, id: reportId, createdAt: at, status: 'new', priority: 'normal', photos: attachments, authorId: localResidentId, confirmations: [], watching: true, duplicateOf: null, history: [{ id: id(), at, text: 'Zgłoszenie zapisane lokalnie. Oczekuje na weryfikację w demo.', status: 'new' }] };
      state.reports.unshift(report);
      state.draft = null;
      return report;
    }),
    update: (reportId, input) => transaction(state => {
      const update = updateSchema.parse(input);
      const report = find(state, reportId);
      validateUpdate(report, update, state.reports);
      const statusChanged = report.status !== update.status;
      const at = new Date().toISOString();
      Object.assign(report, { status: update.status, priority: update.priority, duplicateOf: update.status === 'duplicate' ? update.duplicateOf : null });
      report.history.push({ id: id(), at, text: update.comment || (statusChanged ? `Status zmieniony na: ${statuses[update.status]}.` : 'Zaktualizowano priorytet lub zweryfikowano zgłoszenie.'), status: statusChanged ? update.status : null });
      if (statusChanged && relatedReports(report, state.reports).some(item => item.authorId === localResidentId || item.watching)) {
        state.notifications.unshift({ id: id(), reportId, at, read: false, title: `${report.title} — ${update.status === 'duplicate' ? `połączono ze sprawą ${primaryReport(report, state.reports).id}` : statuses[update.status]}` });
      }
    }),
    watch: reportId => transaction(state => {
      const group = relatedReports(find(state, reportId), state.reports);
      const watching = !group.some(item => item.watching);
      group.forEach(item => { item.watching = watching; });
    }),
    setConfirmation: (reportId, confirmed) => transaction(state => {
      const report = primaryReport(find(state, reportId), state.reports);
      if (!acceptsConfirmations(report)) throw new Error('Ta sprawa jest zakończona.');
      const group = relatedReports(report, state.reports);
      if (group.some(item => item.authorId === localResidentId)) {
        if (!confirmed) throw new Error('Autor jest już liczony jako jedna osoba potwierdzająca problem.');
        return report.id;
      }
      group.forEach(item => { item.confirmations = item.confirmations.filter(person => person !== localResidentId); });
      if (confirmed) report.confirmations.push(localResidentId);
      return report.id;
    }),
    markRead: ids => transaction(state => { for (const notification of state.notifications) if (ids.includes(notification.id)) notification.read = true; }),
    saveDraft: draft => transaction(state => {
      const parsed = draft ? savedDraftSchema.parse(draft) : null;
      if (parsed?.photos.some(photo => photo.kind === 'file' && !files.exists(photo.uri))) throw new Error('Nie udało się zachować zdjęcia. Dodaj je ponownie.');
      state.draft = parsed;
    }),
    reset: () => serialized(async () => {
      let previous = createSeed();
      try { previous = await read(); } catch { /* An explicit reset also recovers invalid data. */ }
      await write(createSeed(), previous);
    }),
  };
}
