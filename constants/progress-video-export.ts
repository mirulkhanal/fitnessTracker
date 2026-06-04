import type { SlideshowSpeedKey } from '@/types/progress-view.types';
import { SLIDESHOW_SPEED_OPTIONS } from '@/types/progress-view.types';

/** Portrait 9:16 — even dimensions for Android encoders. */
export const PROGRESS_VIDEO_WIDTH = 1080;
export const PROGRESS_VIDEO_HEIGHT = 1920;

export const PROGRESS_VIDEO_FPS = 15;

export const MAX_PROGRESS_VIDEO_PHOTOS = 40;

export const MAX_PROGRESS_VIDEO_FRAMES = 600;

export const getSlideshowIntervalMs = (speed: SlideshowSpeedKey): number =>
  SLIDESHOW_SPEED_OPTIONS[speed].intervalMs;

export const getFramesPerSlide = (intervalMs: number, fps = PROGRESS_VIDEO_FPS): number =>
  Math.max(1, Math.round((intervalMs / 1000) * fps));

export const getTotalVideoFrameCount = (photoCount: number, intervalMs: number): number =>
  photoCount * getFramesPerSlide(intervalMs);
