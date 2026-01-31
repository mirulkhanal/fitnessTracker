import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AnimatedAddButton } from '@/components/animated/animated-add-button';
import { HomeHeader } from '@/components/home/HomeHeader';
import { LatestPhotoSection } from '@/components/home/LatestPhotoSection';
import { PhotoSourceModal } from '@/components/modals/photo-source-modal';
import { StatsCards } from '@/components/ui/StatsCards';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useHomeData } from '@/hooks/use-home-data';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const { stats, latestPhoto } = useHomeData();

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
        <HomeHeader title="FitTrack Progress" subtitle="Track your fitness journey with photos" />
        <StatsCards stats={stats} />
        <LatestPhotoSection latestPhoto={latestPhoto} />
      </ScrollView>

      <AnimatedAddButton 
        onPress={handleImageCapture}
        hapticType="medium"
        pressScale={0.9}
      />

      <PhotoSourceModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onCamera={handleCameraSelection}
        onGallery={handleGallerySelection}
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
});
