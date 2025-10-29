import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AnimatedAddButton } from '@/components/animated/animated-add-button';
import { AnimatedModal } from '@/components/modals/animated-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyCard, PhotoCard } from '@/components/ui/PhotoCard';
import { StatsCards } from '@/components/ui/StatsCards';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';
import { appService } from '@/services/app.service';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';
import { useStatsStore } from '@/store/stats.store';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const { categories, loadCategories } = useCategoriesStore();
  const { photos, getValidCategories, getLatestPhoto, loadPhotos } = usePhotosStore();
  const { stats, loadStats } = useStatsStore();

  const loadData = useCallback(async () => {
    try {
      await appService.waitForInitialization();
      
      // Load photos, categories and stats from stores
      await Promise.all([
        loadPhotos(),
        loadCategories(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [loadPhotos, loadCategories, loadStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const latestImage = getLatestPhoto();

  const handleImageCapture = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
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

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
              <IconSymbol name="photo.fill" size={32} color="white" />
            </View>
          </View>
          <ThemedText type="title" style={styles.headerTitle}>FitTrack Progress</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Track your fitness journey with photos</ThemedText>
        </View>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Latest Photo Card */}
        <View style={styles.photoSection}>
          {latestImage ? (
            <PhotoCard
              imageUri={latestImage.uri}
              title="Latest Progress Photo"
              category={getValidCategories(latestImage, categories).join(', ') || 'Uncategorized'}
              date={new Date(latestImage.timestamp).toLocaleDateString()}
            />
          ) : (
            <EmptyCard
              icon="photo"
              title="No Photos Yet"
              description="Start your fitness journey by capturing your first progress photo"
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <AnimatedAddButton 
        onPress={handleImageCapture}
        hapticType="medium"
        pressScale={0.9}
      />

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
            iconColor: colors.secondaryAccent,
            backgroundColor: colors.secondaryAccent + '15',
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24,
  },
  photoSection: {
    paddingHorizontal: 24,
  },
});