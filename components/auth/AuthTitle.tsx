import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';

interface AuthTitleProps {
  title: string;
}

export function AuthTitle({ title }: AuthTitleProps) {
  return <ThemedText style={styles.title}>{title}</ThemedText>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
});
