import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HomeFab } from '@/components/home/HomeFab';
import { HomeLatestProgress } from '@/components/home/HomeLatestProgress';
import { HomeStatsBento } from '@/components/home/HomeStatsBento';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { HomeWelcome } from '@/components/home/HomeWelcome';
import { PhotoSourceModal } from '@/components/modals/photo-source-modal';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useLocalProfile } from '@/contexts/LocalProfileContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useHomeData } from '@/hooks/use-home-data';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';
import { useOpenWorkoutReminders } from '@/hooks/use-open-workout-reminders';

const HEADER_OFFSET = 108;

export default function HomeScreen() {
  const { showAlert } = useAlert();
  const { profile } = useLocalProfile();
  const { fitTrackColors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const openWorkoutReminders = useOpenWorkoutReminders();
  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const { stats, latestPhoto, lastPhotoLabel, isInitialLoad, isRefreshing, deletePhoto, refresh } =
    useHomeData();

  const displayName = profile.display_name.trim() || 'Athlete';

  const handleImageCapture = () => {
    setModalVisible(true);
  };

  const handleCameraSelection = async () => {
    const result = await handleCameraPress();
    if (result) {
      setModalVisible(false);
      router.push({
        pathname: '/category-selection',
        params: {
          imageUri: result.uri,
          width: result.width.toString(),
          height: result.height.toString(),
        },
      });
    }
  };

  const handleGallerySelection = async () => {
    const result = await handleGalleryPress();
    if (result) {
      setModalVisible(false);
      router.push({
        pathname: '/category-selection',
        params: {
          imageUri: result.uri,
          width: result.width.toString(),
          height: result.height.toString(),
        },
      });
    }
  };

  const handleDeletePhoto = useCallback(
    (photoId: string) => {
      showAlert({
        title: 'Delete Photo',
        message: 'Are you sure you want to delete this progress photo?',
        variant: 'warning',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePhoto(photoId);
                await refresh();
              } catch {
                showAlert({
                  title: 'Delete failed',
                  message: 'Could not delete this photo.',
                  variant: 'error',
                });
              }
            },
          },
        ],
      });
    },
    [deletePhoto, refresh, showAlert]
  );

  return (
    <View style={[styles.container, { backgroundColor: fitTrackColors.background }]}>
      <HomeTopBar
        avatarUrl={profile.avatar_url}
        displayName={displayName}
        onProfilePress={() => router.push('/(tabs)/settings')}
        onNotificationsPress={openWorkoutReminders}
      />

      {isInitialLoad ? (
        <ScreenLoading text="Loading progress..." />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isRefreshing ? (
            <View style={styles.refreshRow}>
              <ActivityIndicator size="small" color={fitTrackColors.primaryContainer} />
              <Text style={[styles.refreshText, { color: fitTrackColors.onSurfaceVariant }]}>Updating progress…</Text>
            </View>
          ) : null}
          <HomeWelcome name={displayName} />
          <HomeStatsBento
            totalPhotos={stats.totalPhotos}
            currentStreak={stats.currentStreak}
            lastPhotoLabel={lastPhotoLabel}
          />
          <HomeLatestProgress
            photo={latestPhoto}
            onViewAll={() => router.push('/(tabs)/categories')}
            onDeletePhoto={handleDeletePhoto}
            onExplorePhotos={() => router.push('/(tabs)/categories')}
          />
        </ScrollView>
      )}

      <HomeFab onPress={handleImageCapture} />

      <PhotoSourceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCamera={handleCameraSelection}
        onGallery={handleGallerySelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FitTrackColors.background,
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  refreshText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: FitTrackColors.onSurfaceVariant,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_OFFSET,
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
});
