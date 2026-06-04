import { CategoryDetailView } from '@/components/category-view/CategoryDetailView';
import { HomeFab } from '@/components/home/HomeFab';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { PhotoSourceModal } from '@/components/modals/photo-source-modal';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCategoryPhotoActions } from '@/hooks/use-category-photo-actions';
import { useOpenWorkoutReminders } from '@/hooks/use-open-workout-reminders';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

const HEADER_OFFSET = 108;

export default function CategoryViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string; categoryName?: string }>();
  const { categoryId, categoryName } = params;
  const { showAlert } = useAlert();
  const { session } = useAuth();
  const displayName = session?.display_name?.trim() || 'Athlete';

  const {
    loading,
    photos,
    modalVisible,
    openModal,
    closeModal,
    handleDeletePhoto,
    handleCameraSelection,
    handleGallerySelection,
  } = useCategoryPhotoActions(categoryId);
  const openWorkoutReminders = useOpenWorkoutReminders();

  const title =
    (Array.isArray(categoryName) ? categoryName[0] : categoryName)?.trim() || 'Category';

  const showInitialLoader = loading && photos.length === 0;

  if (showInitialLoader) {
    return (
      <View style={styles.container}>
        <HomeTopBar
          displayName={displayName}
          avatarUrl={session?.avatar_url}
          onBackPress={() => router.back()}
          onNotificationsPress={openWorkoutReminders}
        />
        <View style={[styles.body, { paddingTop: HEADER_OFFSET }]}>
          <ScreenLoading text="Loading photos..." />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeTopBar
        displayName={displayName}
        avatarUrl={session?.avatar_url}
        onBackPress={() => router.back()}
        onNotificationsPress={openWorkoutReminders}
      />

      <View style={styles.body}>
        {loading && photos.length > 0 ? (
          <View style={styles.refreshOverlay}>
            <ActivityIndicator size="small" color={FitTrackColors.primaryContainer} />
          </View>
        ) : null}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_OFFSET }]}
          showsVerticalScrollIndicator={false}
        >
          <CategoryDetailView
            categoryName={title}
            photos={photos}
            onDeletePhoto={handleDeletePhoto}
          />
        </ScrollView>
      </View>

      <HomeFab onPress={openModal} bottomOffset={24} />

      <PhotoSourceModal
        visible={modalVisible}
        onClose={closeModal}
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
  body: {
    flex: 1,
  },
  refreshOverlay: {
    position: 'absolute',
    top: HEADER_OFFSET + 8,
    right: 20,
    zIndex: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
});
