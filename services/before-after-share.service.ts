import { Image } from 'expo-image';
import { RefObject } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { canUseNativeMediaLibrary } from '@/utils/expo-runtime';

const CAPTURE_DELAY_MS = 450;

export const EXPO_GO_SAVE_HINT =
  'Direct save to the gallery is not available in Expo Go. Tap Share comparison, then choose Save image (or your gallery app) from the share sheet. Use a development build for one-tap save.';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function loadSharing() {
  return await import('expo-sharing');
}

export const beforeAfterShareService = {
  async prefetchPhotoUris(uris: string[]): Promise<void> {
    await Promise.all(uris.map(uri => Image.prefetch(uri)));
  },

  async capturePng(viewRef: RefObject<View | null>): Promise<string> {
    if (!viewRef.current) {
      throw new Error('Export view is not ready. Try again in a moment.');
    }
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    if (!uri) {
      throw new Error('Could not create the comparison image.');
    }
    return uri;
  },

  async sharePngFile(fileUri: string): Promise<void> {
    const Sharing = await loadSharing();
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device.');
    }
    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/png',
      dialogTitle: 'Share progress comparison',
    });
  },

  async savePngToGallery(fileUri: string): Promise<void> {
    if (!canUseNativeMediaLibrary()) {
      throw new Error(EXPO_GO_SAVE_HINT);
    }

    const MediaLibrary = await import('expo-media-library');
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Photo library permission is required to save your comparison.');
    }
    await MediaLibrary.saveToLibraryAsync(fileUri);
  },

  async prepareCapture(viewRef: RefObject<View | null>, photoUris: string[]): Promise<void> {
    await this.prefetchPhotoUris(photoUris);
    await wait(CAPTURE_DELAY_MS);
    if (!viewRef.current) {
      throw new Error('Export view is not ready.');
    }
  },
};
