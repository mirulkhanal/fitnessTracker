import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface ProgressImage {
  id: string;
  uri: string;
  width: number;
  height: number;
  timestamp: number;
  categories: string[]; // Changed from single category to array of categories
}

// Temporary interface for migration period
interface LegacyProgressImage {
  id: string;
  uri: string;
  width: number;
  height: number;
  timestamp: number;
  category?: string; // Old format
  categories?: string[]; // New format
}

export interface ProgressStats {
  totalPhotos: number;
  currentStreak: number;
  lastPhotoDate?: number;
}

export interface StreakDay {
  date: string; // YYYY-MM-DD format
  timestamp: number; // When this day was first recorded
  lastPhotoTimestamp?: number; // The most recent photo timestamp for this day
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

class LocalStorageService {
  private readonly STORAGE_KEY = 'progress_images';
  private readonly CATEGORIES_KEY = 'custom_categories';
  private readonly STREAK_KEY = 'streak_days';
  private readonly IMAGES_DIR = 'progress_images';
  private streakIssueLogged = false;

  async init(): Promise<void> {
    // Ensure images directory exists
    if (FileSystem.documentDirectory) {
      const imagesDir = `${FileSystem.documentDirectory}${this.IMAGES_DIR}/`;
      const dirInfo = await FileSystem.getInfoAsync(imagesDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      }
    }
    
    // Migrate existing data from old format to new format
    await this.migrateOldDataFormat();
  }

  // Migrate old data format (category: string) to new format (categories: string[])
  private async migrateOldDataFormat(): Promise<void> {
    try {
      const imagesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!imagesJson) return;
      
      const images: LegacyProgressImage[] = JSON.parse(imagesJson);
      let needsUpdate = false;
      
      const migratedImages = images.map(image => {
        // Check if this image has the old format (category: string)
        if (image.category && !image.categories) {
          needsUpdate = true;
          return {
            ...image,
            categories: [image.category], // Convert single category to array
            category: undefined // Remove old property
          };
        }
        return image;
      });
      
      if (needsUpdate) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(migratedImages));
        console.log('Migrated old data format to new categories array format');
      }
    } catch (error) {
      console.error('Error migrating old data format:', error);
    }
  }

  async saveProgressImage(imageUri: string, categories: string | string[], width: number = 0, height: number = 0): Promise<ProgressImage> {
    if (!FileSystem.documentDirectory) {
      throw new Error('Document directory not available');
    }

    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    const filePath = `${FileSystem.documentDirectory}${this.IMAGES_DIR}/${id}.jpg`;

    try {
      // Copy image to permanent storage using copyAsync for local files
      await FileSystem.copyAsync({
        from: imageUri,
        to: filePath
      });

      // Create image object
      const image: ProgressImage = {
        id,
        uri: filePath,
        width,
        height,
        timestamp,
        categories: Array.isArray(categories) ? categories : [categories],
      };

      // Save metadata to AsyncStorage
      await this.saveImageMetadata(image);

      // Record this day in streak tracking
      await this.recordStreakDay(timestamp);
      
      // Reset the streak issue flag since we're adding a new photo
      this.streakIssueLogged = false;

      return image;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  private async saveImageMetadata(image: ProgressImage): Promise<void> {
    try {
      const existingImages = await this.getProgressImages();
      const updatedImages = [image, ...existingImages];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Error saving image metadata:', error);
      throw error;
    }
  }

  async getProgressImages(category?: string): Promise<ProgressImage[]> {
    try {
      const imagesJson = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!imagesJson) return [];
      
      const images: ProgressImage[] = JSON.parse(imagesJson);
      
      // Filter out images that no longer exist on disk
      const validImages: ProgressImage[] = [];
      for (const image of images) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(image.uri);
          if (fileInfo.exists) {
            validImages.push(image);
          }
        } catch (error) {
          console.log(`Image ${image.id} no longer exists on disk`);
        }
      }

      // Update storage if any images were removed
      if (validImages.length !== images.length) {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(validImages));
      }

      // Filter by category if specified
      if (category) {
        return validImages.filter(img => {
          // Handle both old and new formats during migration
          const legacyImg = img as any; // Type assertion for migration period
          if (legacyImg.categories && Array.isArray(legacyImg.categories)) {
            return legacyImg.categories.includes(category);
          } else if (legacyImg.category) {
            return legacyImg.category === category;
          }
          return false;
        }).sort((a, b) => b.timestamp - a.timestamp);
      }
      
      return validImages.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting progress images:', error);
      return [];
    }
  }

  async deleteProgressImage(id: string): Promise<void> {
    try {
      const images = await this.getProgressImages();
      const imageToDelete = images.find(img => img.id === id);
      
      if (imageToDelete) {
        // Delete file from disk
        try {
          await FileSystem.deleteAsync(imageToDelete.uri, { idempotent: true });
        } catch (error) {
          console.log('File deletion error (file may not exist):', error);
        }

        // Remove from metadata
        const updatedImages = images.filter(img => img.id !== id);
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedImages));
        
        // Check if we need to update streak days
        await this.updateStreakDaysAfterDeletion();
      }
    } catch (error) {
      console.error('Error deleting progress image:', error);
      throw error;
    }
  }

  // Record a day in streak tracking
  private async recordStreakDay(timestamp: number): Promise<void> {
    try {
      const date = new Date(timestamp);
      const dateString = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0'); // YYYY-MM-DD format (local time)
      
      const streakDays = await this.getStreakDays();
      const existingDay = streakDays.find(day => day.date === dateString);
      
      if (!existingDay) {
        streakDays.push({
          date: dateString,
          timestamp: Date.now(),
          lastPhotoTimestamp: timestamp
        });
      } else {
        // Update the last photo timestamp for this day
        existingDay.lastPhotoTimestamp = Math.max(existingDay.lastPhotoTimestamp || 0, timestamp);
      }
      
      // Sort by date (most recent first)
      streakDays.sort((a, b) => b.date.localeCompare(a.date));
      
      await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify(streakDays));
    } catch (error) {
      console.error('Error recording streak day:', error);
    }
  }

  // Get all streak days
  private async getStreakDays(): Promise<StreakDay[]> {
    try {
      const streakJson = await AsyncStorage.getItem(this.STREAK_KEY);
      if (!streakJson) return [];
      return JSON.parse(streakJson);
    } catch (error) {
      console.error('Error getting streak days:', error);
      return [];
    }
  }

  // Calculate current streak from streak days
  private calculateStreakFromDays(streakDays: StreakDay[]): number {
    if (streakDays.length === 0) {
      return 0;
    }
    
    // Use local date instead of UTC to avoid timezone issues
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Sort streak days by date (most recent first)
    const sortedStreakDays = [...streakDays].sort((a, b) => b.date.localeCompare(a.date));
    
    for (const streakDay of sortedStreakDays) {
      // Compare date strings directly
      const dayString = streakDay.date;
      const checkString = checkDate.getFullYear() + '-' + 
        String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(checkDate.getDate()).padStart(2, '0');
      
      if (dayString === checkString) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dayString < checkString) {
        // Gap found, streak is broken
        break;
      } else {
        // This day is in the future, skip it
        continue;
      }
    }
    return currentStreak;
  }

  async getStats(): Promise<ProgressStats> {
    try {
      const images = await this.getProgressImages();
      const totalPhotos = images.length;

      // Calculate streak from streak days (not from current photos)
      const streakDays = await this.getStreakDays();
      const currentStreak = this.calculateStreakFromDays(streakDays);
      
      // Get last photo date from streak days (most recent day with photos)
      const lastPhotoDate = streakDays.length > 0 ? streakDays[0].lastPhotoTimestamp : undefined;

      const result = {
        totalPhotos,
        currentStreak,
        lastPhotoDate,
      };
      
      // Only log when there's a meaningful change or when debugging
      if (totalPhotos > 0 && currentStreak === 0 && !this.streakIssueLogged) {
        console.log('🚨 STREAK ISSUE DETECTED:');
        console.log('  - Total photos:', totalPhotos);
        console.log('  - Streak days:', streakDays.map(d => d.date));
        console.log('  - Current streak:', currentStreak);
        console.log('  - Last photo date:', lastPhotoDate);
        this.streakIssueLogged = true;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalPhotos: 0, currentStreak: 0 };
    }
  }

  async getStorageInfo(): Promise<{usedSpace: number, freeSpace: number}> {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      
      // Calculate used space by checking all our images
      const images = await this.getProgressImages();
      let usedSpace = 0;
      
      for (const image of images) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(image.uri);
          if (fileInfo.exists && fileInfo.size) {
            usedSpace += fileInfo.size;
          }
        } catch (error) {
          console.log('Error getting file size:', error);
        }
      }
      
      return { usedSpace, freeSpace };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { usedSpace: 0, freeSpace: 0 };
    }
  }

  // Save custom category
  async saveCustomCategory(category: Category): Promise<void> {
    try {
      const existingCategories = await this.getCustomCategories();
      const updatedCategories = [...existingCategories, category];
      await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Error saving custom category:', error);
      throw error;
    }
  }

  // Get all custom categories
  async getCustomCategories(): Promise<Category[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(this.CATEGORIES_KEY);
      if (!categoriesJson) return [];
      return JSON.parse(categoriesJson);
    } catch (error) {
      console.error('Error getting custom categories:', error);
      return [];
    }
  }

  // Save all custom categories (for bulk operations)
  async saveCustomCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving custom categories:', error);
      throw error;
    }
  }

  // Get all categories (default + custom)
  async getAllCategories(): Promise<Category[]> {
    const defaultCategories: Category[] = [
      { id: 'default', name: 'Default', color: '#6B7280', icon: 'folder.fill' },
      { id: 'full-body', name: 'Full Body', color: '#4CAF50', icon: 'person.fill' },
      { id: 'abs', name: 'Abs', color: '#2196F3', icon: 'rectangle.fill' },
      { id: 'arms', name: 'Arms', color: '#FF9800', icon: 'hand.raised.fill' },
      { id: 'legs', name: 'Legs', color: '#9C27B0', icon: 'figure.walk' },
      { id: 'chest', name: 'Chest', color: '#F44336', icon: 'heart.fill' },
      { id: 'back', name: 'Back', color: '#607D8B', icon: 'figure.stand' },
    ];

    const customCategories = await this.getCustomCategories();
    return [...defaultCategories, ...customCategories];
  }

  // Add category to an existing image
  async addCategoryToImage(imageId: string, categoryId: string): Promise<void> {
    try {
      const images = await this.getProgressImages();
      const imageIndex = images.findIndex(img => img.id === imageId);
      
      if (imageIndex === -1) {
        throw new Error('Image not found');
      }
      
      const image = images[imageIndex];
      if (!image.categories.includes(categoryId)) {
        image.categories.push(categoryId);
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
      }
    } catch (error) {
      console.error('Error adding category to image:', error);
      throw error;
    }
  }

  // Remove category from an image
  async removeCategoryFromImage(imageId: string, categoryId: string): Promise<void> {
    try {
      const images = await this.getProgressImages();
      const imageIndex = images.findIndex(img => img.id === imageId);
      
      if (imageIndex === -1) {
        throw new Error('Image not found');
      }
      
      const image = images[imageIndex];
      image.categories = image.categories.filter(cat => cat !== categoryId);
      
      // If image has no categories left, delete it
      if (image.categories.length === 0) {
        await this.deleteProgressImage(imageId);
      } else {
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
      }
    } catch (error) {
      console.error('Error removing category from image:', error);
      throw error;
    }
  }

  // Delete category and handle smart deletion of images
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const images = await this.getProgressImages();
      const imagesToUpdate: ProgressImage[] = [];
      const imagesToDelete: string[] = [];
      
      for (const image of images) {
        if (image.categories.includes(categoryId)) {
          // Remove the category from the image
          const updatedCategories = image.categories.filter(cat => cat !== categoryId);
          
          if (updatedCategories.length === 0) {
            // Image has no categories left, mark for deletion
            imagesToDelete.push(image.id);
          } else {
            // Update image with remaining categories
            image.categories = updatedCategories;
            imagesToUpdate.push(image);
          }
        }
      }
      
      // Delete images that have no categories left
      for (const imageId of imagesToDelete) {
        await this.deleteProgressImage(imageId);
      }
      
      // Update remaining images
      if (imagesToUpdate.length > 0) {
        const allImages = await this.getProgressImages();
        const updatedImages = allImages.map(img => {
          const updatedImg = imagesToUpdate.find(ui => ui.id === img.id);
          return updatedImg || img;
        });
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedImages));
      }
      
      // Remove custom category if it exists
      const customCategories = await this.getCustomCategories();
      const updatedCustomCategories = customCategories.filter(cat => cat.id !== categoryId);
      await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(updatedCustomCategories));
      
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }


  // Update streak days after photo deletion
  private async updateStreakDaysAfterDeletion(): Promise<void> {
    try {
      const images = await this.getProgressImages();
      const streakDays = await this.getStreakDays();
      
      // Update lastPhotoTimestamp for each streak day based on remaining photos
      for (const streakDay of streakDays) {
        const dayPhotos = images.filter(img => {
          const photoDate = new Date(img.timestamp).toISOString().split('T')[0];
          return photoDate === streakDay.date;
        });
        
        if (dayPhotos.length > 0) {
          // Update with the most recent photo timestamp for this day
          streakDay.lastPhotoTimestamp = Math.max(...dayPhotos.map(img => img.timestamp));
        } else {
          // No photos left for this day, but keep the streak day
          // The streak day should persist even if all photos are deleted
        }
      }
      
      await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify(streakDays));
    } catch (error) {
      console.error('Error updating streak days after deletion:', error);
    }
  }

  // Clean up old streak days (keep only last 30 days)
  async cleanupOldStreakDays(): Promise<void> {
    try {
      const streakDays = await this.getStreakDays();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      const recentStreakDays = streakDays.filter(day => day.date >= cutoffDate);
      
      if (recentStreakDays.length !== streakDays.length) {
        await AsyncStorage.setItem(this.STREAK_KEY, JSON.stringify(recentStreakDays));
        console.log(`Cleaned up ${streakDays.length - recentStreakDays.length} old streak days`);
      }
    } catch (error) {
      console.error('Error cleaning up old streak days:', error);
    }
  }

  async cleanupOrphanedFiles(): Promise<void> {
    try {
      if (!FileSystem.documentDirectory) {
        console.log('Document directory not available for cleanup');
        return;
      }

      const imagesDir = `${FileSystem.documentDirectory}${this.IMAGES_DIR}/`;
      const allFiles = await FileSystem.readDirectoryAsync(imagesDir);
      
      // Get all database records
      const dbImages = await this.getProgressImages();
      const dbFilePaths = new Set(dbImages.map(img => img.uri.split('/').pop()));
      
      // Delete orphaned files
      for (const file of allFiles) {
        if (file.endsWith('.jpg') && !dbFilePaths.has(file)) {
          await FileSystem.deleteAsync(`${imagesDir}${file}`, { idempotent: true });
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
    }
  }

  // Clear all data including images, categories, and streak data
  async clearAllData(): Promise<void> {
    try {
      console.log('Clearing all data...');
      
      // Clear all AsyncStorage keys
      await AsyncStorage.multiRemove([
        this.STORAGE_KEY,
        this.CATEGORIES_KEY,
        this.STREAK_KEY,
        'progress_stats' // Legacy stats key if it exists
      ]);
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const localStorageService = new LocalStorageService();
