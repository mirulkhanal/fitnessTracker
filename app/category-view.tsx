import { PhotoGrid } from '@/components/lists/PhotoGrid';
import { AnimatedModal } from '@/components/modals/animated-modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';
import { ProgressImage } from '@/services/local-storage.service';
import { usePhotosStore } from '@/store/photos.store';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CategoryViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { categoryId, categoryName } = params;
  const { colors } = useTheme();

  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const [modalVisible, setModalVisible] = React.useState(false);
  const { photos, loading, getPhotosByCategory, savePhoto, deletePhoto, loadPhotos } = usePhotosStore();
  
  const images = getPhotosByCategory(categoryId as string);

  useEffect(() => {
    loadPhotos();
  }, [categoryId, loadPhotos]);

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(imageId);
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Failed to delete photo');
            }
          }
        }
      ]
    );
  };

  const handleAddPhoto = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleCameraSelection = async () => {
    setModalVisible(false);
    const result = await handleCameraPress();
    if (result) {
      try {
        // Save the photo directly to the current category
        await savePhoto(
          result.uri,
          categoryId as string, // Automatically assign to current category
          result.width || 0,
          result.height || 0
        );
      } catch (error) {
        console.error('Error saving photo:', error);
        Alert.alert('Error', 'Failed to save photo');
      }
    }
  };

  const handleGallerySelection = async () => {
    setModalVisible(false);
    const result = await handleGalleryPress();
    if (result) {
      try {
        // Save the photo directly to the current category
        await savePhoto(
          result.uri,
          categoryId as string, // Automatically assign to current category
          result.width || 0,
          result.height || 0
        );
      } catch (error) {
        console.error('Error saving photo:', error);
        Alert.alert('Error', 'Failed to save photo');
      }
    }
  };

  const renderImageItem = ({ item }: { item: ProgressImage }) => (
    <View style={[styles.imageItem, { backgroundColor: colors.cardBackground }]}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <View style={styles.imageInfo}>
        <ThemedText style={styles.imageDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.pinkAccent + '20' }]}
        onPress={() => handleDeleteImage(item.id)}
      >
        <IconSymbol name="trash" size={18} color={colors.pinkAccent} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="photo" size={80} color="#ccc" />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Photos Yet
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Start capturing photos in this category to see your progress!
      </ThemedText>
      <TouchableOpacity
        style={styles.addPhotoButton}
        onPress={handleAddPhoto}
      >
        <IconSymbol name="plus" size={20} color="white" />
        <ThemedText style={styles.addPhotoButtonText}>Add Photo</ThemedText>
      </TouchableOpacity>
    </View>
  );

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
        <LoadingSpinner text="Loading photos..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card variant="elevated" style={{ ...styles.statItem, backgroundColor: colors.cardBackground }}>
          <IconSymbol name="photo.fill" size={24} color={colors.accent} />
          <ThemedText style={styles.statNumber}>{images.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Photos</ThemedText>
        </Card>
        <Card variant="elevated" style={{ ...styles.statItem, backgroundColor: colors.cardBackground }}>
          <IconSymbol name="calendar" size={24} color={colors.secondaryAccent} />
          <ThemedText style={styles.statNumber}>
            {images.length > 0 ? new Date(images[0].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Latest</ThemedText>
        </Card>
      </View>

      {/* Images Grid */}
      <View style={styles.contentContainer}>
        <PhotoGrid
          photos={images}
          onDeletePhoto={handleDeleteImage}
          numColumns={2}
        />
        
        {/* Add Photo Button - Always visible */}
        <Button
          title="Add Photo"
          onPress={handleAddPhoto}
          icon="plus"
          style={{ ...styles.addPhotoButtonFixed, backgroundColor: colors.accent }}
        />
      </View>

      {/* Image Picker Modal */}
      <AnimatedModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title="Add Progress Photo"
        subtitle="Choose how you want to add a photo"
        options={[
          {
            id: 'camera',
            title: 'Camera',
            description: 'Take a new photo',
            icon: 'photo.fill',
            iconColor: colors.accent,
            backgroundColor: colors.accent + '15',
            onPress: handleCameraSelection,
          },
          {
            id: 'gallery',
            title: 'Gallery',
            description: 'Choose from photos',
            icon: 'folder.fill',
            iconColor: colors.pinkAccent,
            backgroundColor: colors.pinkAccent + '15',
            onPress: handleGallerySelection,
          },
        ]}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  statItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    minHeight: 68,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  imagesGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  imageItem: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  imageInfo: {
    padding: 12,
    paddingBottom: 8,
  },
  imageDate: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    margin: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 24,
    fontSize: 16,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addPhotoButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
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
