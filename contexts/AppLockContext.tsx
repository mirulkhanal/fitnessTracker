import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { biometricAuthService } from '@/services/biometric-auth.service';

type AppLockContextValue = {
  isReady: boolean;
  isLocked: boolean;
  releaseLock: () => void;
  /** Keep unlock while a system UI (image picker, camera) owns the foreground. */
  runWithLockSuspended: <T>(operation: () => Promise<T>) => Promise<T>;
};

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);
  const skipNextLockRef = useRef(false);
  const initialLockAppliedRef = useRef(false);
  const lockSuspendCountRef = useRef(0);

  useEffect(() => {
    let active = true;

    const syncLockConfig = async () => {
      if (!isAuthenticated) {
        if (active) {
          setLockEnabled(false);
          setIsLocked(false);
          setIsReady(true);
          initialLockAppliedRef.current = false;
        }
        return;
      }

      const enabled = await biometricAuthService.isEnabled();

      if (!active) {
        return;
      }

      setLockEnabled(enabled);
      if (!enabled) {
        setIsLocked(false);
        initialLockAppliedRef.current = false;
      } else if (!initialLockAppliedRef.current) {
        setIsLocked(true);
        initialLockAppliedRef.current = true;
      }
      setIsReady(true);
    };

    if (isLoading) {
      setIsReady(false);
      return () => {
        active = false;
      };
    }

    void syncLockConfig();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!lockEnabled || !isAuthenticated) {
      return;
    }

    const handleAppState = (nextState: AppStateStatus) => {
      if (lockSuspendCountRef.current > 0) {
        return;
      }
      if (nextState === 'active') {
        if (skipNextLockRef.current) {
          skipNextLockRef.current = false;
          return;
        }
        setIsLocked(true);
      } else if (nextState === 'background' || nextState === 'inactive') {
        setIsLocked(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [isAuthenticated, lockEnabled]);

  const releaseLock = useCallback(() => {
    skipNextLockRef.current = true;
    setIsLocked(false);
  }, []);

  const runWithLockSuspended = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    lockSuspendCountRef.current += 1;
    setIsLocked(false);
    try {
      return await operation();
    } finally {
      lockSuspendCountRef.current = Math.max(0, lockSuspendCountRef.current - 1);
    }
  }, []);

  const value = useMemo<AppLockContextValue>(
    () => ({
      isReady,
      isLocked: lockEnabled && isAuthenticated && isLocked,
      releaseLock,
      runWithLockSuspended,
    }),
    [isAuthenticated, isLocked, isReady, lockEnabled, releaseLock, runWithLockSuspended]
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export const useAppLock = () => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  return context;
};
