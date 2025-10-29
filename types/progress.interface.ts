export interface PhotoCaptureResult {
  uri: string;
  width: number;
  height: number;
}

export interface ProgressImage {
  id: string;
  uri: string;
  width: number;
  height: number;
  timestamp: number;
  category?: string;
  weight?: number;
  measurement?: number;
}

export interface ProgressStats {
  totalPhotos: number;
  currentStreak: number;
  lastPhotoDate?: number;
}
