import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { useAuthStore } from '@/store/auth.store';

export const useSignUpForm = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { loading, error, errorTitle, clearError, signUpWithEmail } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useErrorAlert({
    title: errorTitle ?? 'Sign up failed',
    message: error,
    onDismiss: clearError,
  });

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        title: 'Permission needed',
        message: 'Photo library access is required to select a picture.',
        variant: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  }, [showAlert]);

  const handleEmailSignUp = useCallback(async () => {
    const success = await signUpWithEmail({ email, password, displayName, avatarUri });
    if (success) {
      router.replace('/signup-success');
      setPassword('');
    }
  }, [avatarUri, displayName, email, password, router, signUpWithEmail]);

  return {
    displayName,
    avatarUri,
    email,
    password,
    loading,
    setDisplayName,
    setEmail,
    setPassword,
    handlePickAvatar,
    handleEmailSignUp,
  };
};
