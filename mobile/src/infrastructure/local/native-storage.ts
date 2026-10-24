import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { createLocalGateway } from './gateway';

export const photoDirectory = new Directory(Paths.document, 'report-photos');
export const localGateway = createLocalGateway({
  read: () => AsyncStorage.getItem('zalatamy:demo'),
  write: async value => {
    try { await AsyncStorage.setItem('zalatamy:demo', value); }
    catch { throw new Error('Nie udało się zapisać danych. Sprawdź wolne miejsce i spróbuj ponownie.'); }
  },
}, {
  exists: uri => uri.startsWith(`${photoDirectory.uri.replace(/\/$/, '')}/`) && new File(uri).exists,
  remove: uri => { if (uri.startsWith(`${photoDirectory.uri.replace(/\/$/, '')}/`)) { const file = new File(uri); if (file.exists) file.delete(); } },
}, randomUUID);
