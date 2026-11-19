export type LocalImageSource = { uri: string };

export const resolveLocalImageSource = async (
  uri: string | null | undefined
): Promise<LocalImageSource | null> => uri ? { uri } : null;
