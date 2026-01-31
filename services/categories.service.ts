import { supabase } from '@/services/supabase.client';
import { Category, CreateCategoryRequest } from '@/types/category.types';

interface CategoryRow {
  id: string | number;
  user_id?: string;
  name: string;
  color: string;
  icon: string;
}

const formatSchemaError = (message?: string) => {
  if (!message) {
    return 'Failed to create category';
  }
  if (message.includes('schema cache')) {
    return "Supabase schema cache is stale. In the Supabase SQL editor run: select pg_notify('pgrst', 'reload schema'); then retry.";
  }
  return message;
};

const mapCategory = (row: CategoryRow): Category => ({
  id: String(row.id),
  name: row.name,
  color: row.color,
  icon: row.icon,
});

const listCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCategory);
};

const createCategory = async (request: CreateCategoryRequest): Promise<Category> => {
  const payload = {
    name: request.name.trim(),
    color: request.color ?? '#6C7B7F',
    icon: request.icon,
  };

  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select('id, name, color, icon')
    .single();

  if (error || !data) {
    throw new Error(formatSchemaError(error?.message));
  }

  return mapCategory(data as CategoryRow);
};

const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const payload: Partial<CategoryRow> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name.trim();
  }
  if (updates.color !== undefined) {
    payload.color = updates.color;
  }
  if (updates.icon !== undefined) {
    payload.icon = updates.icon;
  }

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('id, name, color, icon')
    .single();

  if (error || !data) {
    throw new Error(formatSchemaError(error?.message));
  }

  return mapCategory(data as CategoryRow);
};

const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const categoriesService = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
