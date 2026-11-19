import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { biometricAuthService } from '@/services/biometric-auth.service';

type AppLockContextValue = {
  isReady: boolean;
  isLocked: boolean;
  releaseLock: () => void;
  refreshLockConfig: (lockIfEnabled?: boolean) => Promise<void>;
  runWithLockSuspended: <T>(operation: () => Promise<T>) => Promise<T>;
};

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);
  const skipNextLockRef = useRef(false);
  const initialLockAppliedRef = useRef(false);
  const lockSuspendCountRef = useRef(0);

  const refreshLockConfig = useCallback(async (lockIfEnabled = false) => {
    const enabled = await biometricAuthService.isEnabled();
    setLockEnabled(enabled);
    if (!enabled) {
      setIsLocked(false);
      initialLockAppliedRef.current = false;
    } else if (lockIfEnabled && !initialLockAppliedRef.current) {
      setIsLocked(true);
      initialLockAppliedRef.current = true;
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    void refreshLockConfig(true);
  }, [refreshLockConfig]);

  useEffect(() => {
    if (!lockEnabled) return;
    const handleAppState = (nextState: AppStateStatus) => {
      if (lockSuspendCountRef.current > 0) return;
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
  }, [lockEnabled]);

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
      if (lockSuspendCountRef.current === 0) skipNextLockRef.current = true;
    }
  }, []);

  const value = useMemo<AppLockContextValue>(() => ({
    isReady,
    isLocked: lockEnabled && isLocked,
    releaseLock,
    refreshLockConfig,
    runWithLockSuspended,
  }), [isLocked, isReady, lockEnabled, refreshLockConfig, releaseLock, runWithLockSuspended]);

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export const useAppLock = () => {
  const context = useContext(AppLockContext);
  if (!context) throw new Error('useAppLock must be used within AppLockProvider');
  return context;
};
