export type WrAuthDataListQuery = {
  limit?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

export type WrAuthDataListResult<T> = {
  rows: T[];
  total?: number;
  page?: number;
  limit?: number;
};

export type WrAuthCategoryRow = {
  id: string;
  owner_user_id?: string;
  name: string;
  color: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
};

export type WrAuthPhotoMetadataRow = {
  id: string;
  owner_user_id?: string;
  local_id: string;
  width: number;
  height: number;
  captured_at: string;
  categories: string | string[] | unknown;
  created_at?: string;
  updated_at?: string;
};
