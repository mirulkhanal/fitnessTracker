import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface PhotoItem {
  id: string;
  uri: string;
  timestamp: number;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  onPhotoPress?: (photo: PhotoItem) => void;
  onDeletePhoto?: (photoId: string) => void;
  numColumns?: number;
  loading?: boolean;
}

export function PhotoGrid({ 
  photos, 
  onPhotoPress, 
  onDeletePhoto, 
  numColumns = 2,
  loading = false 
}: PhotoGridProps) {
  const { colors } = useTheme();

  const renderPhotoItem = ({ item }: { item: PhotoItem }) => (
    <View style={styles.photoItem}>
      <Card 
        variant="elevated"
        padding="none"
        style={{ ...styles.photoCard, backgroundColor: colors.cardBackground }}
        onPress={() => onPhotoPress?.(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />
        <View style={[styles.photoFooter, { backgroundColor: colors.cardBackground }] }>
          <ThemedText style={[styles.photoDate, { color: colors.text }]}>
            {new Date(item.timestamp).toLocaleDateString()}
          </ThemedText>
          {onDeletePhoto && (
            <TouchableOpacity
              style={[styles.deletePill, { backgroundColor: colors.pinkAccent + '20' }]}
              onPress={() => onDeletePhoto(item.id)}
              activeOpacity={0.7}
            >
              <IconSymbol name="trash" size={16} color={colors.pinkAccent} />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading photos...</ThemedText>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Card variant="elevated" style={{ ...styles.emptyCard, backgroundColor: colors.cardBackground }}>
          <IconSymbol name="photo" size={80} color="#ccc" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Photos Yet
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Start capturing photos to see your progress!
          </ThemedText>
        </Card>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      renderItem={renderPhotoItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  photoItem: {
    flex: 1,
    margin: 8,
    position: 'relative',
  },
  photoCard: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  photoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  photoDate: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  deletePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
    fontSize: 16,
    fontWeight: '400',
  },
  grid: {
    padding: 16,
    paddingBottom: 100,
  },
});
