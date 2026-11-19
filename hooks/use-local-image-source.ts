import { useEffect, useState } from 'react';

import { resolveLocalImageSource, type LocalImageSource } from '@/utils/local-image';

export const useLocalImageSource = (uri: string | null | undefined): LocalImageSource | null => {
  const [source, setSource] = useState<LocalImageSource | null>(null);
  useEffect(() => {
    let cancelled = false;
    void resolveLocalImageSource(uri).then(result => {
      if (!cancelled) setSource(result);
    });
    return () => { cancelled = true; };
  }, [uri]);
  return source;
};
