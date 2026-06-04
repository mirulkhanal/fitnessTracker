import { ProgressImage } from '@/types/photo.types';

/** Oldest first — day 1 → today for timelines and before/after. */
export const sortPhotosChronologically = (photos: ProgressImage[]): ProgressImage[] =>
  [...photos].sort((a, b) => a.timestamp - b.timestamp);

/** Newest first — home latest card and category viewer default. */
export const sortPhotosNewestFirst = (photos: ProgressImage[]): ProgressImage[] =>
  [...photos].sort((a, b) => b.timestamp - a.timestamp);
