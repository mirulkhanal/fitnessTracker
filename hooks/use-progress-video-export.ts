import { useCallback, useRef, useState, type RefObject } from 'react';
import { View } from 'react-native';

import { useAppLock } from '@/contexts/AppLockContext';
import { getSlideshowIntervalMs } from '@/constants/progress-video-export';
import { progressVideoExportService } from '@/services/progress-video-export.service';
import { ProgressImage } from '@/types/photo.types';
import type { SlideshowSpeedKey } from '@/types/progress-view.types';
import {
  canUseProgressVideoExport,
  EXPO_GO_VIDEO_EXPORT_HINT,
} from '@/utils/expo-runtime';

export type VideoSlideCapture = {
  photo: ProgressImage;
  index: number;
  total: number;
  categoryName: string;
} | null;

export const useProgressVideoExport = () => {
  const { runWithLockSuspended } = useAppLock();
  const exportRef = useRef<View | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [slideCapture, setSlideCapture] = useState<VideoSlideCapture>(null);

  const videoExportAvailable = canUseProgressVideoExport();

  const clearSlideCapture = useCallback(() => {
    setSlideCapture(null);
  }, []);

  const exportVideo = useCallback(
    async (
      photos: ProgressImage[],
      categoryName: string,
      speed: SlideshowSpeedKey,
      mode: 'share' | 'save'
    ) => {
      if (!videoExportAvailable) {
        throw new Error(EXPO_GO_VIDEO_EXPORT_HINT);
      }

      setExporting(true);
      setExportProgress(0);

      try {
        return await runWithLockSuspended(async () => {
        const intervalMs = getSlideshowIntervalMs(speed);
        const videoUri = await progressVideoExportService.exportVideo({
          photos,
          categoryName,
          intervalMs,
          viewRef: exportRef,
          setSlide: (photo, index) => {
            setSlideCapture({
              photo,
              index,
              total: photos.length,
              categoryName,
            });
          },
          onProgress: ratio => setExportProgress(ratio),
        });

        if (mode === 'share') {
          await progressVideoExportService.shareVideo(videoUri);
        } else {
          await progressVideoExportService.saveVideoToGallery(videoUri);
        }

        return videoUri;
        });
      } finally {
        setExporting(false);
        setExportProgress(0);
        clearSlideCapture();
      }
    },
    [clearSlideCapture, runWithLockSuspended, videoExportAvailable]
  );

  return {
    exportRef: exportRef as RefObject<View | null>,
    exporting,
    exportProgress,
    slideCapture,
    videoExportAvailable,
    exportProgressVideo: exportVideo,
  };
};
