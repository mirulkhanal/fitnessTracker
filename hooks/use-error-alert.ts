import { useAlert } from '@/contexts/AlertContext';
import { useEffect } from 'react';

interface ErrorAlertOptions {
  title: string;
  message: string | null;
  onDismiss?: () => void;
}

export const useErrorAlert = ({ title, message, onDismiss }: ErrorAlertOptions) => {
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!message) return;
    showAlert({
      title,
      message,
      variant: 'error',
      buttons: [{ text: 'OK', onPress: onDismiss }],
    });
  }, [message, onDismiss, showAlert, title]);
};
