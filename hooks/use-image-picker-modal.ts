import { PhotoCaptureResult } from '@/types/progress.interface';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useImagePickerModal = () => {
  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted' || cameraStatus.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera and photo library permissions are required to capture progress photos.');
      return false;
    }
    return true;
  };

  const captureFromCamera = async (): Promise<PhotoCaptureResult | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width || 0,
          height: result.assets[0].height || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
      return null;
    }
  };

  const selectFromGallery = async (): Promise<PhotoCaptureResult | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width || 0,
          height: result.assets[0].height || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select photo');
      return null;
    }
  };

  const handleCameraPress = async () => {
    const result = await captureFromCamera();
    return result;
  };

  const handleGalleryPress = async () => {
    const result = await selectFromGallery();
    return result;
  };

  return {
    handleCameraPress,
    handleGalleryPress,
  };
};
