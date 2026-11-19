import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useAlert } from '@/contexts/AlertContext';
import { useAppLock } from '@/contexts/AppLockContext';
import {
  biometricAuthService,
  type BiometricAvailability,
} from '@/services/biometric-auth.service';

export const useBiometricAppLockSetting = () => {
  const { showAlert } = useAlert();
  const { refreshLockConfig } = useAppLock();
  const [availability, setAvailability] = useState<BiometricAvailability>('unsupported');
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const refreshState = useCallback(async () => {
    if (!biometricAuthService.isSupportedPlatform()) {
      setAvailability('unsupported');
      setEnabled(false);
      setLoading(false);
      return;
    }
    const [nextAvailability, nextEnabled, nextLabel] = await Promise.all([
      biometricAuthService.getAvailability(),
      biometricAuthService.isEnabled(),
      biometricAuthService.getBiometricLabel(),
    ]);
    setAvailability(nextAvailability);
    setEnabled(nextEnabled);
    setBiometricLabel(nextLabel);
    setLoading(false);
  }, []);

  useEffect(() => { void refreshState(); }, [refreshState]);

  const handleToggle = useCallback(async (nextValue: boolean) => {
    if (nextValue && availability !== 'available') {
      showAlert({
        title: 'Biometrics unavailable',
        message: availability === 'not_enrolled'
          ? 'Set up fingerprint or face unlock in your device settings, then try again.'
          : 'Biometric app lock is available on phones with fingerprint or face unlock.',
        variant: 'warning',
      });
      return;
    }

    setToggling(true);
    try {
      if (nextValue) {
        await biometricAuthService.enable();
        setEnabled(true);
        await refreshLockConfig();
        showAlert({
          title: `${biometricLabel} app lock enabled`,
          message: `FitTrack will ask for ${biometricLabel.toLowerCase()} when you reopen the app.`,
          variant: 'success',
        });
      } else {
        await biometricAuthService.disable();
        setEnabled(false);
        await refreshLockConfig();
        showAlert({
          title: 'App lock disabled',
          message: 'FitTrack will open without a biometric prompt.',
          variant: 'info',
        });
      }
    } catch (error) {
      showAlert({
        title: 'Could not update setting',
        message: error instanceof Error ? error.message : 'Unable to update app lock.',
        variant: 'error',
      });
    } finally {
      setToggling(false);
    }
  }, [availability, biometricLabel, refreshLockConfig, showAlert]);

  return {
    showSetting: biometricAuthService.isSupportedPlatform() && Platform.OS !== 'web',
    availability,
    biometricLabel,
    enabled,
    loading,
    toggling,
    handleToggle,
  };
};
