export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';

export type ButtonSize = 'small' | 'medium' | 'large';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export type ModalVariant = 'bottom-sheet' | 'center' | 'fullscreen';
