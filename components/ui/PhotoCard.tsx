import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PhotoCardProps {
  imageUri: string;
  title?: string;
  category?: string;
  date?: string;
  onPress?: () => void;
}

export function PhotoCard({ 
  imageUri, 
  title, 
  category, 
  date, 
  onPress 
}: PhotoCardProps) {
  const { colors } = useTheme();

  return (
    <Card 
      variant="elevated" 
      style={{ ...styles.card, backgroundColor: colors.cardBackground }}
      onPress={onPress}
    >
      {title && (
        <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      )}
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
      
      {(category || date) && (
        <View style={styles.info}>
          {category && (
            <ThemedText style={styles.category}>
              Category: {category}
            </ThemedText>
          )}
          {date && (
            <ThemedText style={styles.date}>
              {date}
            </ThemedText>
          )}
        </View>
      )}
    </Card>
  );
}

interface EmptyCardProps {
  icon: string;
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export function EmptyCard({ 
  icon, 
  title, 
  description, 
  buttonTitle, 
  onButtonPress 
}: EmptyCardProps) {
  const { colors } = useTheme();

  return (
    <Card 
      variant="elevated" 
      style={{ ...styles.emptyCard, backgroundColor: colors.cardBackground }}
    >
      <IconSymbol name={icon as any} size={80} color={colors.icon} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText style={styles.emptyDescription}>{description}</ThemedText>
      {buttonTitle && onButtonPress && (
        <View style={styles.buttonContainer}>
          {/* Button component would go here if needed */}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: '500',
  },
  date: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 30,
    fontSize: 16,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 16,
  },
});
