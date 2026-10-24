import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { File } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import type { ReportingServices } from '@/application/reporting/services';
import { categories, type Photo } from '@/domain/reports/model';
import { isWithinLodz } from '@/domain/reports/rules';
import { photoDirectory } from '../local/native-storage';

function removePhoto(photo: Photo) {
  const prefix = `${photoDirectory.uri.replace(/\/$/, '')}/`;
  if (photo.kind === 'file' && photo.uri.startsWith(prefix)) {
    const file = new File(photo.uri);
    if (file.exists) file.delete();
  }
}

export const reportingServices: ReportingServices = {
  async pickPhotos(source, remaining) {
    if (remaining < 1) throw new Error('Możesz dodać maksymalnie 5 zdjęć.');
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      throw new Error(
        'Brak uprawnień. Możesz użyć ilustracji demonstracyjnej lub zmienić dostęp w ustawieniach telefonu.',
      );
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, exif: false })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: remaining,
            quality: 1,
            exif: false,
          });
    if (result.canceled) return [];
    if (result.assets.length > remaining)
      throw new Error(`Pozostało miejsc na zdjęcia: ${remaining}.`);
    photoDirectory.create({ idempotent: true, intermediates: true });
    const photos: Photo[] = [];
    try {
      // Normalize sequentially to avoid decoding several full-resolution photos at once.
      for (const asset of result.assets) {
        const context = ImageManipulator.manipulate(asset.uri);
        context.resize({ width: Math.min(asset.width || 1600, 1600) });
        const image = await context.renderAsync();
        const normalized = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
        const temporary = new File(normalized.uri);
        if (!temporary.exists || !temporary.size || temporary.size > 8 * 1024 * 1024)
          throw new Error('Zdjęcie jest puste lub przekracza 8 MB po przygotowaniu.');
        const id = randomUUID();
        const target = new File(photoDirectory, `${id}.jpg`);
        temporary.copy(target);
        photos.push({ id, uri: target.uri, kind: 'file', mime: 'image/jpeg', size: target.size });
        temporary.delete();
      }
      return photos;
    } catch (error) {
      for (const photo of photos) {
        try {
          removePhoto(photo);
        } catch {
          /* A later reset cleans unreferenced files. */
        }
      }
      throw error;
    }
  },
  async locate() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted)
      throw new Error(
        'Brak dostępu do lokalizacji. Wskaż punkt na mapie lub wybierz miejsce demo.',
      );
    if (!(await Location.hasServicesEnabledAsync()))
      throw new Error('Włącz lokalizację telefonu lub wskaż miejsce ręcznie.');
    const result = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Nie udało się ustalić lokalizacji. Wskaż miejsce ręcznie.')),
          15000,
        ),
      ),
    ]);
    const location = { latitude: result.coords.latitude, longitude: result.coords.longitude };
    if (!isWithinLodz(location))
      throw new Error(
        'Twoja lokalizacja jest poza Łodzią. Wybierz punkt w mieście lub miejsce demo.',
      );
    return { location, accuracy: result.coords.accuracy };
  },
  removePhoto,
  async describe(category) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const titles = {
      road: 'Uszkodzona nawierzchnia chodnika',
      lighting: 'Niedziałająca latarnia uliczna',
      waste: 'Odpady w przestrzeni publicznej',
      greenery: 'Uszkodzona zieleń przy alejce',
      other: 'Uszkodzony element wyposażenia miejskiego',
    };
    return {
      title: titles[category],
      description: `Zauważono problem w kategorii: ${categories[category].toLocaleLowerCase('pl')}. Usterka utrudnia korzystanie z przestrzeni publicznej i wymaga sprawdzenia przez odpowiednie służby miejskie.`,
    };
  },
};
