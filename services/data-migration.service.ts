import AsyncStorage from '@react-native-async-storage/async-storage';

import { databaseService, getDatabase } from '@/services/database.service';
import { wrAuthDataService } from '@/services/wrauth-data.service';
import { parseCategoryIds, serializeCategoryIds } from '@/utils/parse-category-ids';

const migrationKeyForUser = (userId: string) => `@fitnesstracker/wrauth_data_migrated/${userId}`;

interface LocalCategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
}

interface LocalPhotoRow {
  id: string;
  user_id: string;
  local_id: string;
  width: number;
  height: number;
  captured_at: string;
  categories: string;
}

const remapCategoriesJson = (categoriesJson: string, idMap: Map<string, string>) => {
  const remapped = parseCategoryIds(categoriesJson)
    .map(categoryId => idMap.get(categoryId) ?? categoryId)
    .filter(Boolean);
  return serializeCategoryIds(remapped);
};

export const dataMigrationService = {
  async migrateLocalDataToWrAuthIfNeeded(): Promise<void> {
    let userId: string;
    try {
      userId = await databaseService.getRequiredUserId();
    } catch {
      return;
    }

    const migrationKey = migrationKeyForUser(userId);
    if ((await AsyncStorage.getItem(migrationKey)) === 'true') {
      return;
    }

    const localCategories = getDatabase().getAllSync<LocalCategoryRow>(
      `SELECT id, user_id, name, color, icon FROM categories WHERE user_id = ?`,
      [userId]
    );
    const localPhotos = getDatabase().getAllSync<LocalPhotoRow>(
      `SELECT id, user_id, local_id, width, height, captured_at, categories
       FROM photo_metadata WHERE user_id = ?`,
      [userId]
    );

    if (localCategories.length === 0 && localPhotos.length === 0) {
      await AsyncStorage.setItem(migrationKey, 'true');
      return;
    }

    const remoteCategories = await wrAuthDataService.listCategories();
    const categoryIdMap = new Map<string, string>();

    for (const localCategory of localCategories) {
      const existing = remoteCategories.find(
        remote =>
          remote.name === localCategory.name &&
          remote.color === localCategory.color &&
          remote.icon === localCategory.icon
      );
      if (existing) {
        categoryIdMap.set(localCategory.id, existing.id);
        continue;
      }

      const created = await wrAuthDataService.createCategory({
        name: localCategory.name,
        color: localCategory.color,
        icon: localCategory.icon,
      });
      categoryIdMap.set(localCategory.id, created.id);
    }

    const remotePhotos = await wrAuthDataService.listPhotoMetadata();
    for (const localPhoto of localPhotos) {
      const remappedCategories = remapCategoriesJson(localPhoto.categories, categoryIdMap);
      const alreadyUploaded = remotePhotos.some(
        remote =>
          remote.local_id === localPhoto.local_id &&
          remote.captured_at === localPhoto.captured_at
      );
      if (alreadyUploaded) {
        continue;
      }

      await wrAuthDataService.createPhotoMetadata({
        local_id: localPhoto.local_id,
        width: localPhoto.width,
        height: localPhoto.height,
        captured_at: localPhoto.captured_at,
        categories: remappedCategories,
      });
    }

    getDatabase().runSync(`DELETE FROM photo_metadata WHERE user_id = ?`, [userId]);
    getDatabase().runSync(`DELETE FROM categories WHERE user_id = ?`, [userId]);
    await AsyncStorage.setItem(migrationKey, 'true');

    if (__DEV__) {
      console.log(
        `[wrAuth] Migrated ${localCategories.length} categories and ${localPhotos.length} photo records to wrAuth.`
      );
    }
  },
};
