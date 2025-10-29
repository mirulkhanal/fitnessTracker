export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CategoryStats {
  id: string;
  name: string;
  color: string;
  icon: string;
  photoCount: number;
  lastPhotoDate?: number;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color?: string;
}

export interface CategoryFilters {
  searchTerm?: string;
  hasPhotos?: boolean;
  sortBy?: 'name' | 'photoCount' | 'lastPhotoDate';
  sortOrder?: 'asc' | 'desc';
}
