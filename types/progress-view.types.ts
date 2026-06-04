export type ProgressViewMode = 'timeline' | 'compare' | 'slideshow';

export type SlideshowSpeedKey = 'slow' | 'medium' | 'fast';

export const SLIDESHOW_SPEED_OPTIONS: Record<
  SlideshowSpeedKey,
  { label: string; intervalMs: number }
> = {
  slow: { label: 'Slow', intervalMs: 2500 },
  medium: { label: 'Medium', intervalMs: 1400 },
  fast: { label: 'Fast', intervalMs: 700 },
};
