import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  biometricAuthService,
  type BiometricAvailability,
} from '@/services/biometric-auth.service';

export const useBiometricLoginSetting = () => {
  const { session } = useAuth();
  const { showAlert } = useAlert();
  const [availability, setAvailability] = useState<BiometricAvailability>('unsupported');
  const [loginLabel, setLoginLabel] = useState('Biometrics');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const signedIn = Boolean(session?.user?.email && session.refresh_token);

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
      biometricAuthService.getLoginLabel(),
    ]);
    setAvailability(nextAvailability);
    setEnabled(nextEnabled);
    setLoginLabel(nextLabel);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState, session?.user?.email]);

  const handleToggle = useCallback(
    async (nextValue: boolean) => {
      if (!signedIn || !session?.refresh_token || !session.user.email) {
        return;
      }

      if (nextValue && availability !== 'available') {
        showAlert({
          title: 'Biometrics unavailable',
          message:
            availability === 'not_enrolled'
              ? 'Set up fingerprint or face unlock in your device settings, then try again.'
              : 'Biometric sign-in is only available on phones with fingerprint or face unlock.',
          variant: 'warning',
        });
        return;
      }

      setToggling(true);
      try {
        if (nextValue) {
          await biometricAuthService.enable(session.refresh_token, session.user.email);
          setEnabled(true);
          showAlert({
            title: `${loginLabel} enabled`,
            message: `You can sign in with ${loginLabel.toLowerCase()} on this device after signing out.`,
            variant: 'success',
          });
        } else {
          await biometricAuthService.disable();
          setEnabled(false);
          showAlert({
            title: `${loginLabel} disabled`,
            message: 'Use your email and password to sign in.',
            variant: 'info',
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to update biometric sign-in.';
        showAlert({
          title: 'Could not update setting',
          message,
          variant: 'error',
        });
      } finally {
        setToggling(false);
      }
    },
    [availability, loginLabel, session, showAlert, signedIn]
  );

  const showSetting =
    biometricAuthService.isSupportedPlatform() && signedIn && Platform.OS !== 'web';

  return {
    showSetting,
    availability,
    loginLabel,
    enabled,
    loading,
    toggling,
    handleToggle,
  };
};
