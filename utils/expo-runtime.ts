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
  'MP4 video export is temporarily unavailable. Use the in-app slideshow or share before/after images instead.';

/** Disabled until a maintained native encoder is added — avoids broken Gradle native deps. */
export const canUseProgressVideoExport = (): boolean => false;
