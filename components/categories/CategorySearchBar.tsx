import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface CategorySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function CategorySearchBar({
  value,
  onChangeText,
  placeholder = 'Search categories...',
}: CategorySearchBarProps) {
  return (
    <GlassPanel style={styles.wrap}>
      <View style={styles.inner}>
        <IconSymbol name="magnifyingglass" size={22} color={FitTrackColors.onSurfaceVariant} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(195, 201, 178, 0.5)"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onBackground,
    padding: 0,
  },
});
