import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router, usePreventRemove } from 'expo-router';
import { useReportMutation } from '@/application/reports/provider';
import { useReportingServices } from '@/application/reporting/services';
import {
  draftSchema,
  emptyDraft,
  maxPhotos,
  type Location,
  type ReportDraft,
  type SavedDraft,
} from '@/domain/reports/model';
import { isWithinLodz } from '@/domain/reports/rules';
import { errorMessage } from '@/shared/lib/format';

export function useReportForm(initial: SavedDraft | null) {
  const [draft, setDraft] = useState(() => initial ?? emptyDraft());
  const current = useRef(draft);
  const [saved, setSaved] = useState(() => JSON.stringify(draft));
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const services = useReportingServices();
  const save = useReportMutation((gateway, value: SavedDraft | null) => gateway.saveDraft(value));
  const create = useReportMutation((gateway, value: ReportDraft) => gateway.create(value));
  const dirty = JSON.stringify(draft) !== saved;

  function change(update: Partial<SavedDraft>) {
    const next = { ...current.current, ...update };
    current.current = next;
    setDraft(next);
    setError('');
    setNotice('');
    if (update.location || update.category || update.photos) setReviewed(false);
    return next;
  }
  async function persist(value = current.current) {
    await save.mutateAsync(value);
    setSaved(JSON.stringify(value));
  }
  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function discard() {
    await save.mutateAsync(null);
    for (const photo of current.current.photos) {
      try {
        services.removePhoto(photo);
      } catch {
        /* The next reset retries unused-file cleanup. */
      }
    }
  }
  const disablePrevention = usePreventRemove((dirty || busy) && !finished, ({ repeat }) => {
    if (locked.current) return;
    Alert.alert('Zachować szkic?', 'Możesz wrócić do niego później, także po zmianie trybu.', [
      { text: 'Zostań', style: 'cancel' },
      {
        text: 'Odrzuć',
        style: 'destructive',
        onPress: () =>
          void run(async () => {
            await discard();
            setFinished(true);
            repeat();
          }),
      },
      {
        text: 'Zachowaj',
        onPress: () =>
          void run(async () => {
            await persist();
            setFinished(true);
            repeat();
          }),
      },
    ]);
  });
  return {
    draft,
    busy,
    error,
    notice,
    reviewed,
    setReviewed,
    change,
    saveOnBlur: () => {
      if (!locked.current) void persist().catch((cause) => setError(errorMessage(cause)));
    },
    save: () =>
      void run(async () => {
        await persist();
        setNotice('Szkic zapisany na urządzeniu.');
      }),
    next: (step: number) =>
      void run(async () => {
        if (step > 0 && !current.current.photos.length)
          throw new Error('Dodaj przynajmniej jedno zdjęcie.');
        if (step > 1 && (!current.current.location || !isWithinLodz(current.current.location)))
          throw new Error('Wskaż miejsce w granicach Łodzi.');
        await persist(change({ step }));
      }),
    pick: (source: 'camera' | 'library') =>
      void run(async () => {
        const photos = await services.pickPhotos(source, maxPhotos - current.current.photos.length);
        if (photos.length)
          await persist(change({ photos: [...current.current.photos, ...photos] }));
      }),
    addDemo: () =>
      void run(async () => {
        if (current.current.photos.length >= maxPhotos)
          throw new Error('Możesz dodać maksymalnie 5 zdjęć.');
        const category = current.current.category;
        await persist(
          change({
            photos: [
              ...current.current.photos,
              {
                id: `demo:${Date.now()}`,
                kind: 'demo',
                uri: `demo:${category}`,
                mime: 'image/svg+xml',
                size: 0,
              },
            ],
          }),
        );
      }),
    remove: (index: number) =>
      void run(async () => {
        await persist(
          change({ photos: current.current.photos.filter((_, position) => position !== index) }),
        );
      }),
    cover: (index: number) =>
      void run(async () => {
        const photo = current.current.photos[index];
        if (photo)
          await persist(
            change({
              photos: [
                photo,
                ...current.current.photos.filter((_, position) => position !== index),
              ],
            }),
          );
      }),
    locate: () =>
      void run(async () => {
        const result = await services.locate();
        await persist(change({ location: result.location, address: 'Lokalizacja GPS, Łódź' }));
        setNotice(
          `Pozycja GPS${result.accuracy === null ? '' : ` · dokładność około ${Math.round(result.accuracy)} m`}. Sprawdź punkt i uzupełnij adres.`,
        );
      }),
    setLocation: (location: Location, address = 'Wybrane miejsce, Łódź') =>
      void run(async () => {
        if (!isWithinLodz(location)) throw new Error('Wybierz punkt w granicach Łodzi.');
        await persist(change({ location, address }));
      }),
    describe: () =>
      void run(async () => {
        change(await services.describe(current.current.category));
        setReviewed(false);
        await persist();
        setNotice('Przykładowy opis przygotowany lokalnie. Sprawdź treść przed zapisem.');
      }),
    openExisting: (id: string) =>
      void run(async () => {
        await persist();
        router.push({ pathname: '/resident/reports/[id]', params: { id } });
      }),
    submit: (hasSimilar: boolean) =>
      void run(async () => {
        if (hasSimilar && !reviewed)
          throw new Error('Sprawdź podobne sprawy i potwierdź, że to osobny problem.');
        const result = draftSchema.safeParse(current.current);
        if (!result.success) throw new Error(result.error.issues[0]?.message ?? 'Sprawdź dane.');
        await persist();
        const report = await create.mutateAsync(result.data);
        setFinished(true);
        disablePrevention();
        router.replace({ pathname: '/resident/reports/[id]', params: { id: report.id } });
      }),
    discard: () =>
      Alert.alert('Odrzucić szkic?', 'Pola i zdjęcia tego szkicu zostaną usunięte.', [
        { text: 'Zachowaj', style: 'cancel' },
        {
          text: 'Odrzuć',
          style: 'destructive',
          onPress: () =>
            void run(async () => {
              await discard();
              setFinished(true);
              disablePrevention();
              if (router.canGoBack()) router.back();
              else router.replace('/resident');
            }),
        },
      ]),
  };
}

export type ReportForm = ReturnType<typeof useReportForm>;
