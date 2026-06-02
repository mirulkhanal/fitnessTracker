import type { ConfigContext, ExpoConfig } from 'expo/config';

const wrauthApiUrl = process.env.EXPO_PUBLIC_WRAUTH_API_URL?.trim() ?? '';
const wrauthAppKey = process.env.EXPO_PUBLIC_WRAUTH_APP_KEY?.trim() ?? '';
const allowCleartext =
  process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true' ||
  wrauthApiUrl.startsWith('http://');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FitTrack Progress',
  slug: 'FitnessTracker',
  userInterfaceStyle: 'dark',
  icon: './assets/images/icon.png',
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.fittrack.progress',
    buildNumber: config.ios?.buildNumber ?? '1',
    infoPlist: {
      ...(config.ios?.infoPlist as object | undefined),
      NSFaceIDUsageDescription:
        'Use Face ID or Touch ID to sign in quickly to FitTrack Progress.',
    },
  },
  android: {
    ...config.android,
    package: 'com.fittrack.progress',
    versionCode: config.android?.versionCode ?? 1,
    adaptiveIcon: {
      backgroundColor: '#051424',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    ...(allowCleartext ? { usesCleartextTraffic: true } : {}),
  } as ExpoConfig['android'],
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#051424',
        dark: {
          backgroundColor: '#051424',
        },
      },
    ],
  ],
  extra: {
    ...config.extra,
    router: {},
    wrauthApiUrl,
    wrauthAppKey,
  },
});
