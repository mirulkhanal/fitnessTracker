import * as ImageManipulator from 'expo-image-manipulator';

const MAX_STORAGE_EDGE = 1920;
const STORAGE_QUALITY = 0.75;

export type CompressedImage = {
  uri: string;
  width: number;
  height: number;
};

export const compressImageForStorage = async (uri: string): Promise<CompressedImage> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_STORAGE_EDGE } }],
    { compress: STORAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
};

