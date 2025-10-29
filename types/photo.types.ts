export interface ProgressImage {
  id: string;
  uri: string;
  width: number;
  height: number;
  timestamp: number;
  categories: string[];
}

export interface PhotoCaptureResult {
  uri: string;
  width: number;
  height: number;
}

export interface SavePhotoRequest {
  imageUri: string;
  categories: string | string[];
  width?: number;
  height?: number;
}

export interface PhotoStats {
  totalPhotos: number;
  photosByCategory: Record<string, number>;
  lastPhotoDate?: number;
}
