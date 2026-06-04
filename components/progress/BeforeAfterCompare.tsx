import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { ProgressImage } from '@/types/photo.types';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface BeforeAfterCompareProps {
  before: ProgressImage;
  after: ProgressImage;
  categoryName: string;
  onSharePress?: () => void;
  onSavePress?: () => void;
  saveUsesShareHint?: boolean;
  sharing?: boolean;
}

function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BeforeAfterCompare({
  before,
  after,
  categoryName,
  onSharePress,
  onSavePress,
  saveUsesShareHint = false,
  sharing = false,
}: BeforeAfterCompareProps) {
  const [displayWidth, setDisplayWidth] = useState(0);
  const containerWidth = useSharedValue(0);
  const dividerX = useSharedValue(0.5);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width > 0) {
        containerWidth.value = width;
        setDisplayWidth(width);
      }
    },
    [containerWidth]
  );

  const panGesture = Gesture.Pan().onUpdate(event => {
    if (containerWidth.value <= 0) {
      return;
    }
    dividerX.value = Math.min(1, Math.max(0, event.x / containerWidth.value));
  });

  const afterClipStyle = useAnimatedStyle(() => ({
    width: dividerX.value * containerWidth.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value * containerWidth.value - 2 }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{categoryName} transformation</Text>
      <Text style={styles.hint}>Drag the divider to compare day 1 vs latest</Text>

      <View style={styles.compareFrame} onLayout={onLayout}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.compareInner}>
            <Image
              source={{ uri: before.uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <Animated.View style={[styles.afterClip, afterClipStyle]}>
              <Image
                source={{ uri: after.uri }}
                style={{ width: displayWidth, height: COMPARE_HEIGHT }}
                contentFit="cover"
              />
            </Animated.View>
            <Animated.View style={[styles.divider, handleStyle]}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerKnob}>
                <IconSymbol name="chevron.left" size={14} color={FitTrackColors.onPrimaryContainer} />
                <IconSymbol name="chevron.right" size={14} color={FitTrackColors.onPrimaryContainer} />
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      <View style={styles.labels}>
        <View style={styles.labelBlock}>
          <Text style={styles.labelTitle}>Before</Text>
          <Text style={styles.labelDate}>{formatShortDate(before.timestamp)}</Text>
        </View>
        <View style={[styles.labelBlock, styles.labelBlockEnd]}>
          <Text style={styles.labelTitle}>After</Text>
          <Text style={styles.labelDate}>{formatShortDate(after.timestamp)}</Text>
        </View>
      </View>

      {onSharePress || onSavePress ? (
        <View style={styles.shareRow}>
          {onSharePress ? (
            <TouchableOpacity
              style={[styles.shareButton, styles.shareButtonPrimary]}
              onPress={onSharePress}
              disabled={sharing}
              activeOpacity={0.85}
            >
              {sharing ? (
                <ActivityIndicator color={FitTrackColors.onPrimaryContainer} size="small" />
              ) : (
                <>
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={18}
                    color={FitTrackColors.onPrimaryContainer}
                  />
                  <Text style={styles.shareButtonTextPrimary}>Share comparison</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
          {onSavePress ? (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={onSavePress}
              disabled={sharing}
              activeOpacity={0.85}
            >
              <IconSymbol name="photo.fill" size={18} color={FitTrackColors.primaryContainer} />
              <Text style={styles.shareButtonText}>
                {saveUsesShareHint ? 'Save (via Share)' : 'Save to gallery'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const COMPARE_HEIGHT = 320;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  heading: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.onBackground,
  },
  hint: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: FitTrackColors.onSurfaceVariant,
  },
  compareFrame: {
    height: COMPARE_HEIGHT,
    borderRadius: FitTrackRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compareInner: {
    flex: 1,
    position: 'relative',
  },
  afterClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: FitTrackColors.primaryContainer,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  dividerKnob: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: FitTrackColors.primaryContainer,
    zIndex: 2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelBlock: {
    gap: 2,
  },
  labelBlockEnd: {
    alignItems: 'flex-end',
  },
  labelTitle: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: FitTrackColors.primaryContainer,
  },
  labelDate: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: FitTrackColors.onSurfaceVariant,
  },
  shareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shareButtonPrimary: {
    backgroundColor: FitTrackColors.primaryContainer,
    borderColor: FitTrackColors.primaryContainer,
  },
  shareButtonText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.primaryContainer,
  },
  shareButtonTextPrimary: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onPrimaryContainer,
  },
});
