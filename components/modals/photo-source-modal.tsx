import React from 'react';

import { AnimatedModal } from '@/components/modals/animated-modal';
import { useTheme } from '@/contexts/ThemeContext';

interface PhotoSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  title?: string;
  subtitle?: string;
  galleryAccent?: string;
}

export function PhotoSourceModal({
  visible,
  onClose,
  onCamera,
  onGallery,
  title = 'Add Progress Photo',
  subtitle = 'Choose how you want to add a photo',
  galleryAccent,
}: PhotoSourceModalProps) {
  const { colors } = useTheme();
  const galleryColor = galleryAccent ?? colors.secondaryAccent;

  return (
    <AnimatedModal
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      options={[
        {
          id: 'camera',
          title: 'Camera',
          description: 'Take a new photo',
          icon: 'photo.fill',
          iconColor: colors.accent,
          backgroundColor: `${colors.accent}15`,
          onPress: onCamera,
        },
        {
          id: 'gallery',
          title: 'Gallery',
          description: 'Choose from photos',
          icon: 'folder.fill',
          iconColor: galleryColor,
          backgroundColor: `${galleryColor}15`,
          onPress: onGallery,
        },
      ]}
    />
  );
}
