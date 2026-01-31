import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface OAuthButtonsProps {
  loading: boolean;
  onGooglePress: () => void;
}

export function OAuthButtons({ loading, onGooglePress }: OAuthButtonsProps) {
  return (
    <View style={styles.oauthRow}>
      <Button title="Continue with Google" onPress={onGooglePress} variant="outline" loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  oauthRow: {
    gap: 12,
  },
});
