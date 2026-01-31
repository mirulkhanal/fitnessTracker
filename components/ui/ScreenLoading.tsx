import React from 'react';
import { StyleSheet } from 'react-native';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedView } from '@/components/ui/themed-view';

interface ScreenLoadingProps {
  text?: string;
}
export function ScreenLoading({ text = 'Loading...' }: ScreenLoadingProps) {
  return (
    <ThemedView style={styles.container}>
      <LoadingSpinner text={text} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
