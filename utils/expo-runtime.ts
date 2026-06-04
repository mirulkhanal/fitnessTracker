import Constants, { ExecutionEnvironment } from 'expo-constants';

/** True when running inside the Expo Go app (store client), not a dev or production build. */
export const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * expo-media-library v56 expects the ExpoMediaLibraryNext native module, which is only
 * linked in dev/production builds — not in the generic Expo Go binary.
 */
export const canUseNativeMediaLibrary = (): boolean => !isExpoGo();

export const EXPO_GO_VIDEO_EXPORT_HINT =
  'Progress video export uses on-device encoding and requires a development or production build. In Expo Go, use the in-app slideshow or share individual frames.';

/**
 * Native PNG → MP4 via expo-image-sequence-encoder (not in the Expo Go binary).
 * Dev/production builds include the native module after `expo prebuild` / EAS build.
 */
export const canUseProgressVideoExport = (): boolean => !isExpoGo();
