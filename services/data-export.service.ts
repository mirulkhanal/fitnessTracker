import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { categoriesService } from '@/services/categories.service';
import { photosService } from '@/services/photos.service';

export const dataExportService = {
  async exportMetadataJson(): Promise<void> {
    const [categories, photos] = await Promise.all([
      categoriesService.listCategories(),
      photosService.listPhotos(),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      })),
      photos: photos.map(photo => ({
        id: photo.id,
        width: photo.width,
        height: photo.height,
        timestamp: photo.timestamp,
        categories: photo.categories,
      })),
      note: 'Photo image files remain encrypted on device and in wrAuth storage; this export is metadata only.',
    };

    const file = new File(Paths.cache, `fittrack-export-${Date.now()}.json`);
    file.write(JSON.stringify(payload, null, 2));

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device.');
    }
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export FitTrack data',
    });
  },
};
