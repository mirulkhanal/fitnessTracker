import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HomeFab } from '@/components/home/HomeFab';
import { HomeLatestProgress } from '@/components/home/HomeLatestProgress';
import { HomeStatsBento } from '@/components/home/HomeStatsBento';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { HomeWelcome } from '@/components/home/HomeWelcome';
import { PhotoSourceModal } from '@/components/modals/photo-source-modal';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHomeData } from '@/hooks/use-home-data';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';

const HEADER_OFFSET = 108;

export default function HomeScreen() {
  const { showAlert } = useAlert();
  const { session } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const { stats, latestPhoto, lastPhotoLabel, loading, deletePhoto, refresh } = useHomeData();

  const displayName = session?.display_name?.trim() || 'Athlete';

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
    <View style={styles.container}>
      <HomeTopBar
        avatarUrl={session?.avatar_url}
        displayName={displayName}
        onProfilePress={() => router.push('/(tabs)/settings')}
        onNotificationsPress={() => {
          showAlert({
            title: 'Notifications',
            message: 'Workout reminders are coming in a future update.',
            variant: 'info',
          });
        }}
      />

      {loading && !latestPhoto && stats.totalPhotos === 0 ? (
        <ScreenLoading text="Loading progress..." />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_OFFSET,
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
});
