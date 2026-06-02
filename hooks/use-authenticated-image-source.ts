import { useMemo } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  resolveAuthenticatedImageSource,
  type AuthenticatedImageSource,
} from '@/utils/authenticated-image';

export const useAuthenticatedImageSource = (
  uri: string | null | undefined
): AuthenticatedImageSource | null => {
  const { session } = useAuth();
  return useMemo(
    () => resolveAuthenticatedImageSource(uri, session?.access_token),
    [session?.access_token, uri]
  );
};
