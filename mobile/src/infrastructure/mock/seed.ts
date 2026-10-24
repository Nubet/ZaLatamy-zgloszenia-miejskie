import { localResidentId, type Category, type DemoState, type Priority, type Status } from '@/domain/reports/model';

const entries: [string, string, Category, Status, Priority, number, number][] = [
  ['Ubytek w nawierzchni jezdni', 'ul. Piotrkowska 140', 'road', 'progress', 'high', 19.4592, 51.7559],
  ['Nie działa latarnia przy przejściu', 'ul. Narutowicza 32', 'lighting', 'new', 'high', 19.4728, 51.7736],
  ['Przepełnione kosze przy parku', 'Park Źródliska', 'waste', 'accepted', 'normal', 19.4805, 51.7528],
  ['Uszkodzony chodnik', 'ul. Gdańska 58', 'road', 'new', 'normal', 19.4474, 51.7682],
  ['Połamana gałąź nad alejką', 'Park im. Sienkiewicza', 'greenery', 'resolved', 'normal', 19.4658, 51.7602],
  ['Odpady przy ścieżce', 'ul. Drewnowska 58', 'waste', 'new', 'normal', 19.4443, 51.7846],
  ['Zniszczona ławka', 'Pasaż Schillera', 'other', 'accepted', 'low', 19.4602, 51.7624],
  ['Nierówna nawierzchnia ścieżki', 'al. Politechniki 10', 'road', 'progress', 'normal', 19.4512, 51.7441],
  ['Niedziałające oświetlenie alejki', 'Park Staromiejski', 'lighting', 'resolved', 'normal', 19.4578, 51.7841],
  ['Nielegalne wysypisko', 'ul. Pomorska 110', 'waste', 'rejected', 'high', 19.4911, 51.7812],
  ['Uszkodzone obrzeże trawnika', 'ul. Kopcińskiego 31', 'greenery', 'accepted', 'low', 19.4871, 51.7694],
  ['Chodnik przy Gdańskiej', 'ul. Gdańska 58', 'road', 'duplicate', 'normal', 19.4475, 51.7683],
];

export function createSeed(now = new Date()): DemoState {
  const reports = entries.map(([title, address, category, status, priority, longitude, latitude], index) => {
    const id = `LDZ-${1042 + index}`;
    const createdAt = new Date(now.getTime() - (index + 1) * 86400000).toISOString();
    return {
      id, title, address, category, status, priority, location: { longitude, latitude },
      description: `${title}. Problem utrudnia korzystanie z przestrzeni publicznej. Prosimy o sprawdzenie miejsca i podjęcie odpowiednich działań.`,
      photos: [{ id: `seed:${index}`, uri: `demo:${category}`, kind: 'demo' as const, mime: 'image/svg+xml', size: 0 }],
      createdAt, authorId: [0, 3, 4].includes(index) ? localResidentId : `resident:${index}`,
      confirmations: index % 3 === 0 ? ['resident:demo-a', 'resident:demo-b'] : [],
      watching: [0, 2, 3, 4, 8].includes(index), duplicateOf: status === 'duplicate' ? 'LDZ-1045' : null,
      history: [{ id: `history:${index}`, at: createdAt, text: 'Zgłoszenie zapisane w wersji demonstracyjnej.', status: 'new' as Status },
        ...(status === 'new' ? [] : [{ id: `history:update:${index}`, at: createdAt, text: status === 'duplicate' ? 'Połączono z LDZ-1045. Dotyczy tego samego chodnika.' : status === 'rejected' ? 'Przekazano poza zakres tego zgłoszenia.' : 'Zaktualizowano stan sprawy.', status }])],
    };
  });
  return { version: 1, reports, draft: null, notifications: [{ id: 'notification:seed', reportId: 'LDZ-1042', title: 'Ubytek w nawierzchni jezdni — W realizacji', at: now.toISOString(), read: false }] };
}
