import Constants, { ExecutionEnvironment } from 'expo-constants';

/** True when running inside the Expo Go app (store client), not a dev or production build. */
export const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * expo-media-library v56 expects the ExpoMediaLibraryNext native module, which is only
 * linked in dev/production builds — not in the generic Expo Go binary.
 */
export const canUseNativeMediaLibrary = (): boolean => !isExpoGo();
