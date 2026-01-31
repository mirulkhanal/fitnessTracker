import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyCard, PhotoCard } from '@/components/ui/PhotoCard';

interface LatestPhotoInfo {
  imageUri: string;
  categoryLabel: string;
  dateLabel: string;
}

interface LatestPhotoSectionProps {
  latestPhoto: LatestPhotoInfo | null;
}

export function LatestPhotoSection({ latestPhoto }: LatestPhotoSectionProps) {
  return (
    <View style={styles.photoSection}>
      {latestPhoto ? (
        <PhotoCard
          imageUri={latestPhoto.imageUri}
          title="Latest Progress Photo"
          category={latestPhoto.categoryLabel}
          date={latestPhoto.dateLabel}
        />
      ) : (
        <EmptyCard
          icon="photo"
          title="No Photos Yet"
          description="Start your fitness journey by capturing your first progress photo"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    paddingHorizontal: 24,
  },
});
