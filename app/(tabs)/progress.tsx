import { HomeTopBar } from '@/components/home/HomeTopBar';
import { BeforeAfterCompare } from '@/components/progress/BeforeAfterCompare';
import { BeforeAfterExportCanvas } from '@/components/progress/BeforeAfterExportCanvas';
import { ProgressCategoryChips } from '@/components/progress/ProgressCategoryChips';
import { ProgressExportCard } from '@/components/progress/ProgressExportCard';
import { ProgressSlideshow } from '@/components/progress/ProgressSlideshow';
import { ProgressVideoSlideCanvas } from '@/components/progress/ProgressVideoSlideCanvas';
import { ProgressTimeline } from '@/components/progress/ProgressTimeline';
import { ProgressViewModeTabs } from '@/components/progress/ProgressViewModeTabs';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { BEFORE_AFTER_EXPORT_WIDTH } from '@/constants/before-after-export';
import { PROGRESS_VIDEO_WIDTH } from '@/constants/progress-video-export';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBeforeAfterShare } from '@/hooks/use-before-after-share';
import { useOpenWorkoutReminders } from '@/hooks/use-open-workout-reminders';
import { useProgressScreen } from '@/hooks/use-progress-screen';
import { useProgressVideoExport } from '@/hooks/use-progress-video-export';
import { EXPO_GO_SAVE_HINT } from '@/services/before-after-share.service';
import {
  canUseNativeMediaLibrary,
  canUseProgressVideoExport,
  EXPO_GO_VIDEO_EXPORT_HINT,
} from '@/utils/expo-runtime';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const HEADER_OFFSET = 108;
const TAB_BAR_PADDING = 100;

export default function ProgressScreen() {
  const { showAlert } = useAlert();
  const { session } = useAuth();
  const displayName = session?.display_name?.trim() || 'Athlete';

  const {
    categoriesWithPhotos,
    selectedCategory,
    selectedCategoryId,
    selectCategory,
    timelinePhotos,
    viewMode,
    setViewMode,
    slideshowSpeed,
    setSlideshowSpeed,
    loading,
  } = useProgressScreen();
  const openWorkoutReminders = useOpenWorkoutReminders();

  const exportRef = useRef<View>(null);
  const { sharing, shareBeforeAfter, saveBeforeAfterToGallery } = useBeforeAfterShare();
  const {
    exportRef: videoSlideRef,
    exporting: videoExporting,
    exportProgress: videoExportProgress,
    slideCapture,
    exportProgressVideo,
  } = useProgressVideoExport();

  const photoCount = timelinePhotos.length;
  const canCompare = photoCount >= 2;
  const canSlideshow = photoCount >= 1;
  const firstPhoto = timelinePhotos[0];
  const lastPhoto = timelinePhotos[timelinePhotos.length - 1];

  useEffect(() => {
    if (viewMode === 'compare' && !canCompare) {
      setViewMode('timeline');
    }
    if (viewMode === 'slideshow' && !canSlideshow) {
      setViewMode('timeline');
    }
  }, [canCompare, canSlideshow, setViewMode, viewMode]);

  const runVideoExport = useCallback(
    async (mode: 'share' | 'save') => {
      if (!selectedCategory || !canSlideshow) {
        return;
      }
      try {
        await exportProgressVideo(timelinePhotos, selectedCategory.name, slideshowSpeed, mode);
        if (mode === 'save') {
          showAlert({
            title: 'Video saved',
            message: 'Your progress video was saved to your photo library.',
            variant: 'success',
          });
        }
      } catch (error) {
        showAlert({
          title: mode === 'share' ? 'Share failed' : 'Save failed',
          message: error instanceof Error ? error.message : 'Unable to export the video.',
          variant: 'error',
        });
      }
    },
    [
      canSlideshow,
      exportProgressVideo,
      selectedCategory,
      showAlert,
      slideshowSpeed,
      timelinePhotos,
    ]
  );

  const handleVideoExportPress = useCallback(() => {
    if (!canUseProgressVideoExport()) {
      showAlert({
        title: 'Video export',
        message: EXPO_GO_VIDEO_EXPORT_HINT,
        variant: 'info',
      });
      return;
    }
    if (!canSlideshow || !selectedCategory) {
      showAlert({
        title: 'Need photos',
        message: 'Add at least one progress photo in this category to export a video.',
        variant: 'warning',
      });
      return;
    }
    if (videoExporting) {
      return;
    }

    const buttons: { text: string; style?: 'cancel'; onPress?: () => void }[] = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Share video',
        onPress: () => void runVideoExport('share'),
      },
    ];

    if (canUseNativeMediaLibrary()) {
      buttons.push({
        text: 'Save to gallery',
        onPress: () => void runVideoExport('save'),
      });
    }

    showAlert({
      title: 'Export progress video',
      message: `Creates an MP4 from ${timelinePhotos.length} photos using your ${slideshowSpeed} slideshow timing.`,
      variant: 'info',
      buttons,
    });
  }, [
    canSlideshow,
    runVideoExport,
    selectedCategory,
    showAlert,
    slideshowSpeed,
    timelinePhotos.length,
    videoExporting,
  ]);

  const runBeforeAfterExport = useCallback(
    async (mode: 'share' | 'save') => {
      if (!canCompare || !firstPhoto || !lastPhoto) {
        showAlert({
          title: 'Need more photos',
          message: 'Add at least two photos in this category to create a before/after image.',
          variant: 'warning',
        });
        return;
      }

      try {
        if (mode === 'share') {
          await shareBeforeAfter({ exportRef, before: firstPhoto, after: lastPhoto });
        } else {
          await saveBeforeAfterToGallery({ exportRef, before: firstPhoto, after: lastPhoto });
          showAlert({
            title: 'Saved',
            message: 'Your before/after comparison was saved to your photo library.',
            variant: 'success',
          });
        }
      } catch (error) {
        showAlert({
          title: mode === 'share' ? 'Share failed' : 'Save failed',
          message: error instanceof Error ? error.message : 'Unable to export the comparison.',
          variant: 'error',
        });
      }
    },
    [
      canCompare,
      firstPhoto,
      lastPhoto,
      saveBeforeAfterToGallery,
      shareBeforeAfter,
      showAlert,
    ]
  );

  const handleShareBeforeAfter = useCallback(() => {
    void runBeforeAfterExport('share');
  }, [runBeforeAfterExport]);

  const handleSaveBeforeAfter = useCallback(() => {
    if (!canUseNativeMediaLibrary()) {
      showAlert({
        title: 'Save via Share in Expo Go',
        message: EXPO_GO_SAVE_HINT,
        variant: 'info',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share comparison',
            onPress: () => void runBeforeAfterExport('share'),
          },
        ],
      });
      return;
    }
    void runBeforeAfterExport('save');
  }, [runBeforeAfterExport, showAlert]);

  return (
    <View style={styles.container}>
      <HomeTopBar
        avatarUrl={session?.avatar_url}
        displayName={displayName}
        onProfilePress={() => router.push('/(tabs)/settings')}
        onNotificationsPress={openWorkoutReminders}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_OFFSET }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Progress</Text>
        <Text style={styles.pageSubtitle}>
          Track transformation by category — timeline, compare, and slideshow.
        </Text>

        {loading && categoriesWithPhotos.length === 0 ? (
          <ScreenLoading text="Loading progress..." />
        ) : categoriesWithPhotos.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No progress photos yet</Text>
            <Text style={styles.emptyBody}>
              Add photos to a category from Home or Categories, then come back to see your journey.
            </Text>
          </View>
        ) : (
          <>
            <ProgressCategoryChips
              categories={categoriesWithPhotos}
              selectedId={selectedCategoryId}
              onSelect={selectCategory}
            />

            {loading && photoCount === 0 ? (
              <ScreenLoading text="Loading photos..." />
            ) : selectedCategory && photoCount > 0 ? (
              <>
                <ProgressViewModeTabs
                  value={viewMode}
                  onChange={setViewMode}
                  compareDisabled={!canCompare}
                  slideshowDisabled={!canSlideshow}
                />

                {viewMode === 'timeline' ? (
                  <ProgressTimeline
                    photos={timelinePhotos}
                    categoryName={selectedCategory.name}
                  />
                ) : null}

                {viewMode === 'compare' && canCompare && firstPhoto && lastPhoto ? (
                  <BeforeAfterCompare
                    before={firstPhoto}
                    after={lastPhoto}
                    categoryName={selectedCategory.name}
                    onSharePress={handleShareBeforeAfter}
                    onSavePress={handleSaveBeforeAfter}
                    saveUsesShareHint={!canUseNativeMediaLibrary()}
                    sharing={sharing}
                  />
                ) : null}

                {viewMode === 'slideshow' && canSlideshow ? (
                  <ProgressSlideshow
                    photos={timelinePhotos}
                    categoryName={selectedCategory.name}
                    speed={slideshowSpeed}
                    onSpeedChange={setSlideshowSpeed}
                  />
                ) : null}

                <ProgressExportCard
                  videoExportAvailable={canUseProgressVideoExport()}
                  videoExporting={videoExporting}
                  videoExportProgress={videoExportProgress}
                  onVideoExportPress={handleVideoExportPress}
                  onShareableComparePress={handleShareBeforeAfter}
                  shareCompareDisabled={!canCompare}
                  shareCompareLoading={sharing}
                />
              </>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No photos in this category</Text>
                <Text style={styles.emptyBody}>Pick another category or add a progress photo.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {canCompare && firstPhoto && lastPhoto && selectedCategory ? (
        <View style={styles.exportCaptureHost} pointerEvents="none" collapsable={false}>
          <BeforeAfterExportCanvas
            ref={exportRef}
            before={firstPhoto}
            after={lastPhoto}
            categoryName={selectedCategory.name}
          />
        </View>
      ) : null}

      {slideCapture ? (
        <View style={styles.videoCaptureHost} pointerEvents="none" collapsable={false}>
          <ProgressVideoSlideCanvas
            ref={videoSlideRef}
            photo={slideCapture.photo}
            categoryName={slideCapture.categoryName}
            slideIndex={slideCapture.index}
            slideTotal={slideCapture.total}
          />
        </View>
      ) : null}
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
    paddingHorizontal: 20,
    paddingBottom: TAB_BAR_PADDING,
    gap: 20,
  },
  pageTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 28,
    lineHeight: 34,
    color: FitTrackColors.onBackground,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
    marginTop: -8,
  },
  empty: {
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    color: FitTrackColors.onBackground,
  },
  emptyBody: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
  },
  exportCaptureHost: {
    position: 'absolute',
    left: -BEFORE_AFTER_EXPORT_WIDTH - 50,
    top: 0,
    opacity: 0,
  },
  videoCaptureHost: {
    position: 'absolute',
    left: -PROGRESS_VIDEO_WIDTH - 50,
    top: 0,
    opacity: 0,
  },
});
