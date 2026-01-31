import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';
type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

interface AlertButton {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: AlertButtonStyle;
}

interface AlertOptions {
  title: string;
  message?: string;
  variant?: AlertVariant;
  icon?: React.ComponentProps<typeof IconSymbol>['name'];
  buttons?: AlertButton[];
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert(options);
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const buttons = useMemo(() => {
    if (!alert) return [];
    if (alert.buttons && alert.buttons.length > 0) return alert.buttons;
    return [{ text: 'OK' }];
  }, [alert]);

  const variant: AlertVariant = alert?.variant ?? 'info';

  const defaultIcons: Record<AlertVariant, React.ComponentProps<typeof IconSymbol>['name']> = {
    info: 'info.circle',
    success: 'checkmark.circle.fill',
    warning: 'exclamationmark.triangle.fill',
    error: 'xmark.circle.fill',
  };

  const iconName = alert?.icon ?? defaultIcons[variant];

  const variantColor = {
    info: colors.accent,
    success: colors.accent,
    warning: colors.secondaryAccent,
    error: colors.error,
  }[variant];

  const allowOverlayClose = buttons.some((button) => button.style === 'cancel') || buttons.length <= 1;

  const handleButtonPress = useCallback(
    (button: AlertButton) => async () => {
      hideAlert();
      if (button.onPress) {
        await button.onPress();
      }
    },
    [hideAlert]
  );

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={!!alert}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={allowOverlayClose ? hideAlert : undefined}
        >
          <Pressable style={[styles.container, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
            <View style={[styles.iconContainer, { backgroundColor: variantColor + '1F' }]}>
              <IconSymbol name={iconName} size={32} color={variantColor} />
            </View>
            <ThemedText style={styles.title}>{alert?.title ?? ''}</ThemedText>
            {alert?.message ? (
              <ThemedText style={[styles.message, { color: colors.icon }]}>{alert.message}</ThemedText>
            ) : null}
            <View style={styles.buttonRow}>
              {buttons.map((button, index) => {
                const buttonVariant =
                  button.style === 'destructive' ? 'destructive' : button.style === 'cancel' ? 'outline' : 'primary';
                return (
                  <Button
                    key={`${button.text}-${index}`}
                    title={button.text}
                    onPress={handleButtonPress(button)}
                    variant={buttonVariant}
                    style={styles.button}
                  />
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonRow: {
    marginTop: 8,
    gap: 10,
  },
  button: {
    width: '100%',
  },
});
