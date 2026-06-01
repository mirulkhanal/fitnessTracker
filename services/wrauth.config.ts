import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/** wrAuth HTTP API base URL (set via EXPO_PUBLIC_WRAUTH_API_URL at build time). */
export const wrauthApiUrl = String(
  process.env.EXPO_PUBLIC_WRAUTH_API_URL ?? extra.wrauthApiUrl ?? ''
).replace(/\/$/, '');

/** wrAuth app API key (set via EXPO_PUBLIC_WRAUTH_APP_KEY at build time). */
export const wrauthAppKey = String(
  process.env.EXPO_PUBLIC_WRAUTH_APP_KEY ?? extra.wrauthAppKey ?? ''
);

export const wrauthConfigured = Boolean(wrauthApiUrl && wrauthAppKey);
