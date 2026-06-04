import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_STORAGE_EDGE = 1920;
const MAX_PREVIEW_EDGE = 800;
const STORAGE_QUALITY = 0.75;
const PREVIEW_QUALITY = 0.7;

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

export const createPreviewFromUri = async (uri: string): Promise<Uint8Array> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_PREVIEW_EDGE } }],
    { compress: PREVIEW_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
  );
  return await new File(result.uri).bytes();
};
