import { Category, CreateCategoryRequest } from '@/types/category.types';

import { dataMigrationService } from './data-migration.service';
import { wrAuthDataService } from './wrauth-data.service';

const mapCategory = (row: {
  id: string;
  name: string;
  color: string;
  icon: string;
}): Category => ({
  id: row.id,
  name: row.name,
  color: row.color,
  icon: row.icon,
});

const ensureSynced = async () => {
  await dataMigrationService.migrateLocalDataToWrAuthIfNeeded();
};

const listCategories = async (): Promise<Category[]> => {
  await ensureSynced();
  const rows = await wrAuthDataService.listCategories();
  return rows.map(mapCategory);
};

const createCategory = async (request: CreateCategoryRequest): Promise<Category> => {
  await ensureSynced();
  const row = await wrAuthDataService.createCategory({
    name: request.name.trim(),
    color: request.color ?? '#6C7B7F',
    icon: request.icon,
  });
  return mapCategory(row);
};

const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  await ensureSynced();
  const existingRows = await wrAuthDataService.listCategories();
  const existing = existingRows.find(row => row.id === id);
  if (!existing) {
    throw new Error('Category not found');
  }

  const row = await wrAuthDataService.updateCategory(id, {
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.color !== undefined ? { color: updates.color } : {}),
    ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
  });

  return mapCategory(row);
};

const deleteCategory = async (id: string): Promise<void> => {
  await ensureSynced();
  await wrAuthDataService.deleteCategory(id);
};

export const categoriesService = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
