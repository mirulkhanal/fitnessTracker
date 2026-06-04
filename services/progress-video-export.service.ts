import { Directory, File, Paths } from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import { View } from 'react-native';

import {
  MAX_PROGRESS_VIDEO_FRAMES,
  MAX_PROGRESS_VIDEO_PHOTOS,
  PROGRESS_VIDEO_FPS,
  PROGRESS_VIDEO_HEIGHT,
  PROGRESS_VIDEO_WIDTH,
  getFramesPerSlide,
  getTotalVideoFrameCount,
} from '@/constants/progress-video-export';
import { beforeAfterShareService } from '@/services/before-after-share.service';
import { ProgressImage } from '@/types/photo.types';
import {
  canUseNativeMediaLibrary,
  canUseProgressVideoExport,
  EXPO_GO_VIDEO_EXPORT_HINT,
} from '@/utils/expo-runtime';

const CAPTURE_DELAY_MS = 500;
const FRAME_PREFIX = 'frame-';
const FRAMES_DIR_NAME = 'progress-video-frames';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const padFrameName = (index: number) => `${FRAME_PREFIX}${String(index).padStart(5, '0')}.png`;

const ensureFramesDirectory = (): Directory => {
  const framesDir = new Directory(Paths.cache, FRAMES_DIR_NAME);
  if (framesDir.exists) {
    framesDir.delete();
  }
  framesDir.create();
  return framesDir;
};

const loadEncoder = async () => {
  if (!canUseProgressVideoExport()) {
    throw new Error(EXPO_GO_VIDEO_EXPORT_HINT);
  }
  return await import('expo-image-sequence-encoder');
};

export type ProgressVideoCaptureContext = {
  photos: ProgressImage[];
  categoryName: string;
  intervalMs: number;
  viewRef: RefObject<View | null>;
  setSlide: (photo: ProgressImage, index: number) => void;
  onProgress?: (ratio: number) => void;
};

export const progressVideoExportService = {
  validateExport(photoCount: number, intervalMs: number): void {
    if (photoCount < 1) {
      throw new Error('Add at least one photo in this category to export a video.');
    }
    if (photoCount > MAX_PROGRESS_VIDEO_PHOTOS) {
      throw new Error(
        `This category has ${photoCount} photos. Export supports up to ${MAX_PROGRESS_VIDEO_PHOTOS} — try a smaller category or remove older photos.`
      );
    }
    const totalFrames = getTotalVideoFrameCount(photoCount, intervalMs);
    if (totalFrames > MAX_PROGRESS_VIDEO_FRAMES) {
      throw new Error(
        'This slideshow would produce a very long video. Switch to Fast speed or use fewer photos.'
      );
    }
  },

  async captureSlidePng(viewRef: RefObject<View | null>): Promise<string> {
    if (!viewRef.current) {
      throw new Error('Video frame is not ready. Try again.');
    }
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      width: PROGRESS_VIDEO_WIDTH,
      height: PROGRESS_VIDEO_HEIGHT,
    });
    if (!uri) {
      throw new Error('Could not capture a video frame.');
    }
    return uri;
  },

  async buildFrameSequence(context: ProgressVideoCaptureContext): Promise<Directory> {
    const { photos, intervalMs, viewRef, setSlide, onProgress } = context;
    const framesPerSlide = getFramesPerSlide(intervalMs, PROGRESS_VIDEO_FPS);
    const framesDir = ensureFramesDirectory();
    let frameIndex = 0;
    const totalFrames = photos.length * framesPerSlide;

    for (let i = 0; i < photos.length; i += 1) {
      const photo = photos[i];
      setSlide(photo, i);
      await beforeAfterShareService.prefetchPhotoUris([photo.uri]);
      await wait(CAPTURE_DELAY_MS);
      const captureUri = await this.captureSlidePng(viewRef);
      const slideBytes = await new File(captureUri).bytes();

      for (let f = 0; f < framesPerSlide; f += 1) {
        const frameFile = new File(framesDir, padFrameName(frameIndex));
        frameFile.write(slideBytes);
        frameIndex += 1;
        onProgress?.(frameIndex / totalFrames);
      }

      if (captureUri.startsWith('file://')) {
        try {
          new File(captureUri).delete();
        } catch {
          // Best-effort temp cleanup
        }
      }
    }

    return framesDir;
  },

  async encodeFramesDirectory(framesDir: Directory): Promise<string> {
    const { encode } = await loadEncoder();
    const outputFile = new File(Paths.cache, `fittrack-progress-${Date.now()}.mp4`);
    if (outputFile.exists) {
      outputFile.delete();
    }

    const folder = framesDir.uri.endsWith('/') ? framesDir.uri : `${framesDir.uri}/`;

    await encode({
      folder,
      fps: PROGRESS_VIDEO_FPS,
      width: PROGRESS_VIDEO_WIDTH,
      height: PROGRESS_VIDEO_HEIGHT,
      output: outputFile.uri,
      container: 'mp4',
    });

    framesDir.delete();
    return outputFile.uri;
  },

  async exportVideo(context: ProgressVideoCaptureContext): Promise<string> {
    this.validateExport(context.photos.length, context.intervalMs);
    context.onProgress?.(0);
    const framesDir = await this.buildFrameSequence(context);
    context.onProgress?.(0.92);
    const videoUri = await this.encodeFramesDirectory(framesDir);
    context.onProgress?.(1);
    return videoUri;
  },

  async shareVideo(fileUri: string): Promise<void> {
    const Sharing = await import('expo-sharing');
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device.');
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'video/mp4',
      dialogTitle: 'Share progress video',
    });
  },

  async saveVideoToGallery(fileUri: string): Promise<void> {
    if (!canUseNativeMediaLibrary()) {
      throw new Error(EXPO_GO_VIDEO_EXPORT_HINT);
    }
    const MediaLibrary = await import('expo-media-library');
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Photo library permission is required to save your video.');
    }
    await MediaLibrary.saveToLibraryAsync(fileUri);
  },
};
