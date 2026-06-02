import { wrauthApiUrl, wrauthAppKey } from '@/services/wrauth.config';
import { isWrAuthStorageRef, parseWrAuthStorageRef } from '@/constants/wrauth-storage';

export type AuthenticatedImageSource = {
  uri: string;
  headers?: Record<string, string>;
};

export const buildStorageObjectUrl = (objectId: string): string =>
  `${wrauthApiUrl}/storage/objects/${objectId}`;

export const resolveAuthenticatedImageSource = (
  uri: string | null | undefined,
  accessToken: string | null | undefined
): AuthenticatedImageSource | null => {
  if (!uri) {
    return null;
  }
  if (isWrAuthStorageRef(uri)) {
    if (!accessToken) {
      return null;
    }
    const objectId = parseWrAuthStorageRef(uri);
    return {
      uri: buildStorageObjectUrl(objectId),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-App-Key': wrauthAppKey,
      },
    };
  }
  return { uri };
};
