import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const extraProguardRules = readFileSync(join(__dirname, 'proguard-rules.pro'), 'utf8');

const wrauthApiUrl = process.env.EXPO_PUBLIC_WRAUTH_API_URL?.trim() ?? '';
const wrauthAppKey = process.env.EXPO_PUBLIC_WRAUTH_APP_KEY?.trim() ?? '';

/** `__DEV__` is not available when Node evaluates app.config — use build env instead. */
const isEasProductionBuild = process.env.EAS_BUILD_PROFILE === 'production';
const allowCleartext =
  !isEasProductionBuild &&
  (process.env.EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true' || wrauthApiUrl.startsWith('http://'));

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FitTrack Progress',
  slug: 'FitnessTracker',
  userInterfaceStyle: 'dark',
  icon: './assets/images/icon.png',
  updates: {
    url: 'https://u.expo.dev/02087f60-dc6c-4250-8815-980529edc4c9',
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
  },
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.fittrack.progress',
    buildNumber: config.ios?.buildNumber ?? '1',
    infoPlist: {
      ...(config.ios?.infoPlist as object | undefined),
      NSFaceIDUsageDescription:
        'Use Face ID or Touch ID to unlock FitTrack Progress when you open the app.',
    },
  },
  android: {
    ...config.android,
    package: 'com.fittrack.progress',
    adaptiveIcon: {
      backgroundColor: '#051424',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    ...(allowCleartext ? { usesCleartextTraffic: true } : {}),
    allowBackup: false,
  } as ExpoConfig['android'],
  plugins: [
    ...(config.plugins ?? []),
    'expo-updates',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: allowCleartext,
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          extraProguardRules,
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow FitTrack Progress to access photos you choose for progress tracking and your profile avatar.',
        cameraPermission:
          'Allow FitTrack Progress to take progress photos and profile pictures with your camera.',
      },
    ],
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
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#9EF01A',
      },
    ],
    [
      'expo-media-library',
      {
        photosPermission:
          'Allow FitTrack Progress to save your progress comparison images to your photo library.',
        savePhotosPermission:
          'Allow FitTrack Progress to save your progress comparison images to your photo library.',
        isAccessMediaLocationEnabled: false,
      },
    ],
  ],
  extra: {
    ...config.extra,
    router: {},
    wrauthApiUrl,
    wrauthAppKey,
    eas: {
      projectId: '02087f60-dc6c-4250-8815-980529edc4c9',
      ...(typeof config.extra === 'object' && config.extra && 'eas' in config.extra
        ? (config.extra as { eas?: object }).eas
        : {}),
    },
  },
});
