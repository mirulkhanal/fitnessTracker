import React from 'react';
import { Modal, ScrollView, StyleSheet } from 'react-native';

import { CategoryForm } from '@/components/forms/CategoryForm';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { CreateCategoryRequest } from '@/types/category.types';

interface CategoryFormModalProps {
  visible: boolean;
  loading: boolean;
  initialName?: string;
  initialIcon?: string;
  initialColor?: string;
  onClose: () => void;
  onSubmit: (request: CreateCategoryRequest) => void;
  onCancel: () => void;
}

export function CategoryFormModal({
  visible,
  loading,
  initialName,
  initialIcon,
  initialColor,
  onClose,
  onSubmit,
  onCancel,
}: CategoryFormModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CategoryForm
              onSubmit={onSubmit}
              onCancel={onCancel}
              loading={loading}
              initialName={initialName}
              initialIcon={initialIcon}
              initialColor={initialColor}
            />
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxWidth: '90%',
    maxHeight: '85%',
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
});
