import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  localProfileService,
  type LocalProfile,
  type LocalProfileUpdates,
} from '@/services/local-profile.service';

type LocalProfileContextValue = {
  isLoading: boolean;
  profile: LocalProfile;
  saveProfile: (updates: LocalProfileUpdates, completeSetup?: boolean) => Promise<void>;
  reloadProfile: () => Promise<void>;
};

const LocalProfileContext = createContext<LocalProfileContextValue | null>(null);

export { LocalProfileContext };

export function LocalProfileProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<LocalProfile>({
    display_name: '',
    avatar_url: null,
    bio: null,
    setup_complete: false,
  });

  const reloadProfile = useCallback(async () => {
    setProfile(await localProfileService.get());
  }, []);

  useEffect(() => {
    void reloadProfile().finally(() => setIsLoading(false));
  }, [reloadProfile]);

  const saveProfile = useCallback(async (updates: LocalProfileUpdates, completeSetup = false) => {
    setProfile(await localProfileService.save(updates, completeSetup));
  }, []);

  const value = useMemo(() => ({ isLoading, profile, saveProfile, reloadProfile }),
    [isLoading, profile, reloadProfile, saveProfile]);
  return <LocalProfileContext.Provider value={value}>{children}</LocalProfileContext.Provider>;
}

export const useLocalProfile = () => {
  const context = useContext(LocalProfileContext);
  if (!context) throw new Error('useLocalProfile must be used within LocalProfileProvider');
  return context;
};
