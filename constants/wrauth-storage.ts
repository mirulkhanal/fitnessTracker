export const WRAUTH_STORAGE_PREFIX = 'wrauth-storage://';

export const isWrAuthStorageRef = (value: string | null | undefined): boolean =>
  Boolean(value && value.startsWith(WRAUTH_STORAGE_PREFIX));

export const toWrAuthStorageRef = (objectId: string): string =>
  `${WRAUTH_STORAGE_PREFIX}${objectId}`;

export const parseWrAuthStorageRef = (value: string): string =>
  value.slice(WRAUTH_STORAGE_PREFIX.length);
