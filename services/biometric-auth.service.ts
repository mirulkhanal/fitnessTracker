import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ENABLED_KEY = '@fitnesstracker/biometric_login_enabled';
const EMAIL_KEY = '@fitnesstracker/biometric_login_email';
const CREDENTIALS_KEY = 'fitnesstracker_biometric_credentials';

type StoredBiometricCredentials = {
  refresh_token: string;
  email: string;
};

export type BiometricAvailability =
  | 'unsupported'
  | 'not_enrolled'
  | 'available';

const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

const parseCredentials = (raw: string | null): StoredBiometricCredentials | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredBiometricCredentials;
    if (!parsed.refresh_token || !parsed.email) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const biometricAuthService = {
  isSupportedPlatform(): boolean {
    return isNativeMobile;
  },

  async getAvailability(): Promise<BiometricAvailability> {
    if (!isNativeMobile) {
      return 'unsupported';
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return 'unsupported';
    }
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return 'not_enrolled';
    }
    return 'available';
  },

  async getLoginLabel(): Promise<string> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    return 'Biometrics';
  },

  async isEnabled(): Promise<boolean> {
    if (!isNativeMobile) {
      return false;
    }
    const flag = await AsyncStorage.getItem(ENABLED_KEY);
    return flag === 'true';
  },

  async getStoredEmail(): Promise<string | null> {
    if (!(await this.isEnabled())) {
      return null;
    }
    return AsyncStorage.getItem(EMAIL_KEY);
  },

  async enable(refreshToken: string, email: string): Promise<void> {
    const availability = await this.getAvailability();
    if (availability === 'unsupported') {
      throw new Error('This device does not support biometric sign-in.');
    }
    if (availability === 'not_enrolled') {
      throw new Error('Add a fingerprint or face unlock in your device settings first.');
    }

    const confirmation = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm to enable quick sign-in',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    if (!confirmation.success) {
      throw new Error('Biometric confirmation was cancelled.');
    }

    const payload: StoredBiometricCredentials = {
      refresh_token: refreshToken,
      email,
    };

    await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(payload), {
      requireAuthentication: true,
      authenticationPrompt: 'Unlock FitTrack Progress',
    });
    await AsyncStorage.multiSet([
      [ENABLED_KEY, 'true'],
      [EMAIL_KEY, email],
    ]);
  },

  async disable(): Promise<void> {
    await AsyncStorage.multiRemove([ENABLED_KEY, EMAIL_KEY]);
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    } catch {
      // Item may already be missing after sign-out or a failed enable.
    }
  },

  async unlockCredentials(): Promise<StoredBiometricCredentials> {
    if (!(await this.isEnabled())) {
      throw new Error('Biometric sign-in is not enabled.');
    }

    const raw = await SecureStore.getItemAsync(CREDENTIALS_KEY, {
      requireAuthentication: true,
      authenticationPrompt: 'Sign in to FitTrack Progress',
    });
    const credentials = parseCredentials(raw);
    if (!credentials) {
      await this.disable();
      throw new Error('Saved sign-in is no longer valid. Sign in with your password and enable biometrics again.');
    }
    return credentials;
  },
};
