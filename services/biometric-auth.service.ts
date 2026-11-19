import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const ENABLED_KEY = '@fitnesstracker/local_app_lock_enabled';
const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export type BiometricAvailability = 'unsupported' | 'not_enrolled' | 'available';

const authenticate = async (promptMessage: string): Promise<void> => {
  if (!isNativeMobile || !(await LocalAuthentication.hasHardwareAsync())) {
    throw new Error('This device does not support biometric unlock.');
  }
  if (!(await LocalAuthentication.isEnrolledAsync())) {
    throw new Error('Add a fingerprint or face unlock in your device settings first.');
  }
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  if (!result.success) throw new Error('Biometric verification was cancelled.');
};

export const biometricAuthService = {
  isSupportedPlatform: () => isNativeMobile,

  async getAvailability(): Promise<BiometricAvailability> {
    if (!isNativeMobile || !(await LocalAuthentication.hasHardwareAsync())) return 'unsupported';
    return (await LocalAuthentication.isEnrolledAsync()) ? 'available' : 'not_enrolled';
  },

  async getBiometricLabel(): Promise<string> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
    return 'Biometrics';
  },

  async isEnabled(): Promise<boolean> {
    return isNativeMobile && (await AsyncStorage.getItem(ENABLED_KEY)) === 'true';
  },

  async enable(): Promise<void> {
    const availability = await this.getAvailability();
    if (availability === 'unsupported') throw new Error('This device does not support biometric unlock.');
    if (availability === 'not_enrolled') throw new Error('Add a fingerprint or face unlock in your device settings first.');
    await authenticate('Confirm to enable app lock');
    await AsyncStorage.setItem(ENABLED_KEY, 'true');
  },

  async disable(): Promise<void> {
    await AsyncStorage.removeItem(ENABLED_KEY);
  },

  async unlockAppAccess(): Promise<void> {
    if (!(await this.isEnabled())) throw new Error('App lock is not enabled.');
    await authenticate('Unlock FitTrack Progress');
  },
};
