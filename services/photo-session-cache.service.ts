/** In-memory decrypted image URIs for the current app session (cleared on sign-out). */
const cache = new Map<string, string>();

export const photoSessionCache = {
  get(photoId: string): string | undefined {
    return cache.get(photoId);
  },

  set(photoId: string, dataUri: string): void {
    cache.set(photoId, dataUri);
  },

  remove(photoId: string): void {
    cache.delete(photoId);
  },

  clear(): void {
    cache.clear();
  },
};
