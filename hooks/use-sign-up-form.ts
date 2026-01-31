import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { getDeepLinkUrl } from '@/services/deep-link.service';
import { supabase } from '@/services/supabase.client';

export const useSignUpForm = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const clearError = useCallback(() => {
    setError(null);
    setErrorTitle(null);
  }, []);

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
    if (!email || !password) {
      setErrorTitle('Missing details');
      setError('Enter your email and password to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    setErrorTitle(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          emailRedirectTo: getDeepLinkUrl('auth-callback'),
        },
      });
      
      if (authError) {
        setErrorTitle('Sign up failed');
        setError(authError.message);
        return;
      }
      setPassword('');
      router.replace('/signup-success');
    } finally {
      setLoading(false);
    }
  }, [displayName, email, password, router]);

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
