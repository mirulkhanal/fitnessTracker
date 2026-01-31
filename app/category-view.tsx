import { CategoryStatsRow } from '@/components/category-view/CategoryStatsRow';
import { PhotoGrid } from '@/components/lists/PhotoGrid';
import { PhotoSourceModal } from '@/components/modals/photo-source-modal';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useCategoryPhotoActions } from '@/hooks/use-category-photo-actions';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CategoryViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { categoryId } = params;
  const { colors } = useTheme();
  const {
    loading,
    photos,
    modalVisible,
    openModal,
    closeModal,
    handleDeletePhoto,
    handleCameraSelection,
    handleGallerySelection,
  } = useCategoryPhotoActions(categoryId as string);
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="#666" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Loading...</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <ScreenLoading text="Loading photos..." />
      </ThemedView>
    );
  }

  const latestLabel =
    photos.length > 0
      ? new Date(photos[0].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'None';

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <CategoryStatsRow photoCount={photos.length} latestLabel={latestLabel} />
      <View style={styles.contentContainer}>
        <PhotoGrid
          photos={photos}
          onDeletePhoto={handleDeletePhoto}
          numColumns={2}
        />
        <Button
          title="Add Photo"
          onPress={openModal}
          icon="plus"
          style={{ ...styles.addPhotoButtonFixed, backgroundColor: colors.accent }}
        />
      </View>

      <PhotoSourceModal
        visible={modalVisible}
        onClose={closeModal}
        onCamera={handleCameraSelection}
        onGallery={handleGallerySelection}
        galleryAccent={colors.pinkAccent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 44,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  addPhotoButtonFixed: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
