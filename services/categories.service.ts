import { Category, CreateCategoryRequest } from '@/types/category.types';
import { databaseService, getDatabase } from './database.service';

type CategoryRow = Category & { created_at: string };

const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  color: row.color,
  icon: row.icon,
});

const listCategories = async (): Promise<Category[]> => {
  const rows = getDatabase().getAllSync<CategoryRow>(
    'SELECT id, name, color, icon, created_at FROM categories ORDER BY created_at ASC'
  );
  return rows.map(mapCategory);
};

const createCategory = async (request: CreateCategoryRequest): Promise<Category> => {
  const row: CategoryRow = {
    id: databaseService.createId(),
    name: request.name.trim(),
    color: request.color ?? '#6C7B7F',
    icon: request.icon,
    created_at: new Date().toISOString(),
  };
  getDatabase().runSync(
    'INSERT INTO categories (id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?)',
    [row.id, row.name, row.color, row.icon, row.created_at]
  );
  return mapCategory(row);
};

const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const db = getDatabase();
  const current = db.getFirstSync<CategoryRow>(
    'SELECT id, name, color, icon, created_at FROM categories WHERE id = ?', [id]
  );
  if (!current) throw new Error('Category not found.');
  const next = {
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    color: updates.color ?? current.color,
    icon: updates.icon ?? current.icon,
  };
  db.runSync('UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?',
    [next.name, next.color, next.icon, id]);
  return { id, ...next };
};

const deleteCategory = async (id: string): Promise<void> => {
  getDatabase().runSync('DELETE FROM categories WHERE id = ?', [id]);
};

export const categoriesService = { listCategories, createCategory, updateCategory, deleteCategory };
