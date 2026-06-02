import { authSessionService } from '@/services/auth-session.service';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import type { WrAuthCategoryRow, WrAuthPhotoMetadataRow } from '@/types/wrauth-data.types';

const filterOwnedRows = async <T extends { owner_user_id?: string }>(
  rows: T[]
): Promise<T[]> => {
  const session = await authSessionService.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return [];
  }
  return rows.filter(row => !row.owner_user_id || row.owner_user_id === userId);
};

const getAccessToken = async (): Promise<string> => {
  const token = await authSessionService.getAccessToken();
  if (!token) {
    throw new Error('Sign in required');
  }
  return token;
};

const isMissingTableError = (error: unknown) =>
  error instanceof WrAuthRequestError &&
  (error.code === 'TABLE_NOT_FOUND' || error.code === 'NOT_FOUND');

const missingTableMessage = (table: string) =>
  `wrAuth table "${table}" is missing. Create it in wrAuth admin (Data Tables) — see README.md.`;

export const wrAuthDataService = {
  async listCategories(): Promise<WrAuthCategoryRow[]> {
    const accessToken = await getAccessToken();
    try {
      const rows = await wrAuthClient.listAllDataRows<WrAuthCategoryRow>('categories', accessToken, {
        sort: 'created_at',
        order: 'asc',
      });
      return await filterOwnedRows(rows);
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('categories'));
      }
      throw error;
    }
  },

  async createCategory(payload: {
    name: string;
    color: string;
    icon: string;
  }): Promise<WrAuthCategoryRow> {
    const accessToken = await getAccessToken();
    try {
      const result = await wrAuthClient.createDataRow<WrAuthCategoryRow>('categories', accessToken, payload);
      return result.row;
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('categories'));
      }
      throw error;
    }
  },

  async updateCategory(
    id: string,
    payload: Partial<Pick<WrAuthCategoryRow, 'name' | 'color' | 'icon'>>
  ): Promise<WrAuthCategoryRow> {
    const accessToken = await getAccessToken();
    try {
      const result = await wrAuthClient.updateDataRow<WrAuthCategoryRow>(
        'categories',
        accessToken,
        id,
        payload
      );
      return result.row;
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('categories'));
      }
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    const accessToken = await getAccessToken();
    try {
      await wrAuthClient.deleteDataRow('categories', accessToken, id);
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('categories'));
      }
      throw error;
    }
  },

  async listPhotoMetadata(): Promise<WrAuthPhotoMetadataRow[]> {
    const accessToken = await getAccessToken();
    try {
      const rows = await wrAuthClient.listAllDataRows<WrAuthPhotoMetadataRow>(
        'photo_metadata',
        accessToken,
        {
          sort: 'captured_at',
          order: 'desc',
        }
      );
      return await filterOwnedRows(rows);
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('photo_metadata'));
      }
      throw error;
    }
  },

  async createPhotoMetadata(payload: {
    local_id: string;
    width: number;
    height: number;
    captured_at: string;
    categories: string;
  }): Promise<WrAuthPhotoMetadataRow> {
    const accessToken = await getAccessToken();
    try {
      const result = await wrAuthClient.createDataRow<WrAuthPhotoMetadataRow>(
        'photo_metadata',
        accessToken,
        payload
      );
      return result.row;
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('photo_metadata'));
      }
      throw error;
    }
  },

  async updatePhotoMetadata(
    id: string,
    payload: Partial<Pick<WrAuthPhotoMetadataRow, 'local_id' | 'width' | 'height' | 'captured_at' | 'categories'>>
  ): Promise<WrAuthPhotoMetadataRow> {
    const accessToken = await getAccessToken();
    try {
      const result = await wrAuthClient.updateDataRow<WrAuthPhotoMetadataRow>(
        'photo_metadata',
        accessToken,
        id,
        payload
      );
      return result.row;
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('photo_metadata'));
      }
      throw error;
    }
  },

  async deletePhotoMetadata(id: string): Promise<void> {
    const accessToken = await getAccessToken();
    try {
      await wrAuthClient.deleteDataRow('photo_metadata', accessToken, id);
    } catch (error) {
      if (isMissingTableError(error)) {
        throw new Error(missingTableMessage('photo_metadata'));
      }
      throw error;
    }
  },
};
