import { useCallback, useState, type RefObject } from 'react';
import { View } from 'react-native';

import { beforeAfterShareService } from '@/services/before-after-share.service';
import { ProgressImage } from '@/types/photo.types';

type ShareParams = {
  exportRef: RefObject<View | null>;
  before: ProgressImage;
  after: ProgressImage;
};

export const useBeforeAfterShare = () => {
  const [sharing, setSharing] = useState(false);

  const shareBeforeAfter = useCallback(async ({ exportRef, before, after }: ShareParams) => {
    setSharing(true);
    try {
      await beforeAfterShareService.prepareCapture(exportRef, [before.uri, after.uri]);
      const fileUri = await beforeAfterShareService.capturePng(exportRef);
      await beforeAfterShareService.sharePngFile(fileUri);
    } finally {
      setSharing(false);
    }
  }, []);

  const saveBeforeAfterToGallery = useCallback(async ({ exportRef, before, after }: ShareParams) => {
    setSharing(true);
    try {
      await beforeAfterShareService.prepareCapture(exportRef, [before.uri, after.uri]);
      const fileUri = await beforeAfterShareService.capturePng(exportRef);
      await beforeAfterShareService.savePngToGallery(fileUri);
      return fileUri;
    } finally {
      setSharing(false);
    }
  }, []);

  return {
    sharing,
    shareBeforeAfter,
    saveBeforeAfterToGallery,
  };
};
