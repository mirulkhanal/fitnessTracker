import { CategoryDetailView } from '@/components/category-view/CategoryDetailView';
import { HomeFab } from '@/components/home/HomeFab';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { PhotoSourceModal } from '@/components/modals/photo-source-modal';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCategoryPhotoActions } from '@/hooks/use-category-photo-actions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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

  const title =
    (Array.isArray(categoryName) ? categoryName[0] : categoryName)?.trim() || 'Category';

  if (loading && photos.length === 0) {
    return (
      <View style={styles.container}>
        <HomeTopBar
          displayName={displayName}
          avatarUrl={session?.avatar_url}
          onBackPress={() => router.back()}
          onNotificationsPress={() => {
            showAlert({
              title: 'Notifications',
              message: 'Workout reminders are coming in a future update.',
              variant: 'info',
            });
          }}
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
        onNotificationsPress={() => {
          showAlert({
            title: 'Notifications',
            message: 'Workout reminders are coming in a future update.',
            variant: 'info',
          });
        }}
      />

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

      <HomeFab onPress={openModal} />

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
});
