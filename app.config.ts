import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const extraProguardRules = readFileSync(join(__dirname, 'proguard-rules.pro'), 'utf8');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FitTrack Progress',
  slug: 'FitnessTracker',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
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
    allowBackup: false,
  } as ExpoConfig['android'],
  plugins: [
    ...(config.plugins ?? []),
    './plugins/with-local-data-no-backup',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: false,
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
        imageWidth: 280,
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
  },
});
