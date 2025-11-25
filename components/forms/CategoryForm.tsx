import { FitnessIconPicker } from '@/components/icons/FitnessIconPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/themed-text';
import { CreateCategoryRequest } from '@/types/category.types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface CategoryFormProps {
  onSubmit: (request: CreateCategoryRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  initialName?: string;
  initialIcon?: string;
  initialColor?: string;
}

export function CategoryForm({
  onSubmit,
  onCancel,
  loading = false,
  initialName = '',
  initialIcon = 'photo.fill',
  initialColor = '#FF6B6B',
}: CategoryFormProps) {
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    setError(undefined);
    onSubmit({
      name: name.trim(),
      icon,
      color,
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {initialName ? 'Edit Category' : 'Add New Category'}
      </ThemedText>

      <Input
        label="Category Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter category name"
        error={error}
        autoFocus
        style={styles.input}
      />

      <FitnessIconPicker
        value={icon}
        onChange={(id, selectedColor) => {
          setIcon(id);
          if (selectedColor) {
            setColor(selectedColor);
          }
        }}
        collapsible={true}
        visibleIcons={4}
        columns={4}
      />

      <View style={styles.buttons}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title={initialName ? 'Update' : 'Create'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
