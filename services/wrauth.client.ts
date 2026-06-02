import type {
  WrAuthDataListQuery,
  WrAuthDataListResult,
} from '@/types/wrauth-data.types';
import type {
  WrAuthApiError,
  WrAuthLoginResult,
  WrAuthProfile,
  WrAuthRegisterResult,
  WrAuthSessionTokens,
  WrAuthUser,
} from '@/types/wrauth.types';

import {
  isWrAuthStorageRef,
  parseWrAuthStorageRef,
} from '@/constants/wrauth-storage';

import { wrauthApiUrl, wrauthAppKey } from './wrauth.config';

export class WrAuthRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'WrAuthRequestError';
    this.status = status;
    this.code = code;
  }
}

const parseError = async (response: Response): Promise<WrAuthRequestError> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = (await response.json()) as { error?: WrAuthApiError };
    const code = body.error?.code ?? 'REQUEST_FAILED';
    const message = body.error?.message ?? `Request failed (${response.status})`;
    return new WrAuthRequestError(response.status, code, message);
  }
  const text = await response.text();
  return new WrAuthRequestError(
    response.status,
    'REQUEST_FAILED',
    text || `Request failed (${response.status})`
  );
};

type AuthRequestOptions = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
};

const authRequest = async <T>({
  path,
  method = 'POST',
  body,
  accessToken,
}: AuthRequestOptions): Promise<T> => {
  if (!wrauthApiUrl || !wrauthAppKey) {
    throw new WrAuthRequestError(
      0,
      'WRAUTH_NOT_CONFIGURED',
      'wrAuth is not configured. Set EXPO_PUBLIC_WRAUTH_API_URL and EXPO_PUBLIC_WRAUTH_APP_KEY.'
    );
  }

  const headers: Record<string, string> = {
    'X-App-Key': wrauthAppKey,
  };
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${wrauthApiUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Network request failed';
    throw new WrAuthRequestError(
      0,
      'NETWORK_ERROR',
      `Cannot reach wrAuth at ${wrauthApiUrl} (${detail}). Check the API URL, device network, and that the server is running.`
    );
  }

  if (!response.ok) {
    const apiError = await parseError(response);
    if (__DEV__) {
      console.warn('[wrAuth]', method, path, apiError.status, apiError.code, apiError.message);
    }
    throw apiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new WrAuthRequestError(
      response.status,
      'INVALID_RESPONSE',
      'wrAuth returned a non-JSON response. Check that EXPO_PUBLIC_WRAUTH_API_URL points to the API (port 4000), not the admin UI.'
    );
  }
};

const isSessionTokens = (value: WrAuthLoginResult): value is WrAuthSessionTokens =>
  'access_token' in value && 'refresh_token' in value;

type ProfileUpsertInput = {
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
};

export const wrAuthClient = {
  register: (email: string, password: string, profile?: ProfileUpsertInput) => {
    const body: Record<string, unknown> = { email, password };
    if (profile?.display_name?.trim()) {
      body.display_name = profile.display_name.trim();
    }
    if (profile?.avatar_url != null && String(profile.avatar_url).trim()) {
      body.avatar_url = String(profile.avatar_url).trim();
    }
    if (profile?.bio != null && String(profile.bio).trim()) {
      body.bio = String(profile.bio).trim();
    }
    return authRequest<WrAuthRegisterResult>({
      path: '/auth/register',
      body,
    });
  },

  login: (email: string, password: string) =>
    authRequest<WrAuthLoginResult>({
      path: '/auth/login',
      body: { email, password },
    }),

  refresh: (refreshToken: string) =>
    authRequest<WrAuthSessionTokens>({
      path: '/auth/refresh',
      body: { refresh_token: refreshToken },
    }),

  logout: (refreshToken: string) =>
    authRequest<void>({
      path: '/auth/logout',
      body: { refresh_token: refreshToken },
    }),

  me: (accessToken: string) =>
    authRequest<WrAuthUser>({
      path: '/auth/me',
      method: 'GET',
      accessToken,
    }),

  verifyEmailWithToken: (token: string) =>
    authRequest<{ message: string }>({
      path: '/auth/verify-email',
      body: { token },
    }),

  verifyEmailWithOtp: (email: string, otp: string) =>
    authRequest<{ message: string }>({
      path: '/auth/verify-email',
      body: { email, otp },
    }),

  resendVerification: (email: string) =>
    authRequest<{ message: string }>({
      path: '/auth/resend-verification',
      body: { email },
    }),

  requestPasswordReset: (email: string) =>
    authRequest<{ message: string }>({
      path: '/auth/request-password-reset',
      body: { email },
    }),

  resetPassword: (token: string, newPassword: string) =>
    authRequest<{ message: string }>({
      path: '/auth/reset-password',
      body: { token, new_password: newPassword },
    }),

  getProfile: async (accessToken: string): Promise<WrAuthProfile | null> => {
    try {
      const result = await authRequest<{ rows: WrAuthProfile[] }>({
        path: '/data/profiles?limit=1&page=1&sort=created_at&order=desc',
        method: 'GET',
        accessToken,
      });
      return result.rows?.[0] ?? null;
    } catch (error) {
      if (
        error instanceof WrAuthRequestError &&
        (error.code === 'TABLE_NOT_FOUND' || error.code === 'NOT_FOUND')
      ) {
        return null;
      }
      throw error;
    }
  },

  upsertProfile: async (
    accessToken: string,
    payload: ProfileUpsertInput
  ): Promise<WrAuthProfile | null> => {
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as ProfileUpsertInput;
    if (Object.keys(sanitizedPayload).length === 0) {
      return await wrAuthClient.getProfile(accessToken);
    }

    const existing = await wrAuthClient.getProfile(accessToken);
    try {
      if (existing?.id) {
        const updated = await authRequest<{ row: WrAuthProfile }>({
          path: `/data/profiles/${existing.id}`,
          method: 'PATCH',
          accessToken,
          body: sanitizedPayload,
        });
        return updated.row;
      }
      const created = await authRequest<{ row: WrAuthProfile }>({
        path: '/data/profiles',
        method: 'POST',
        accessToken,
        body: sanitizedPayload,
      });
      return created.row;
    } catch (error) {
      if (error instanceof WrAuthRequestError) {
        if (error.code === 'TABLE_NOT_FOUND' || error.code === 'NOT_FOUND') {
          if (__DEV__) {
            console.warn(
              '[wrAuth] profiles table missing — add it in wrAuth admin under Data Tables.',
              error.message
            );
          }
          return null;
        }
        if (__DEV__) {
          console.warn('[wrAuth] upsertProfile failed:', error.code, error.message);
        }
      }
      throw error;
    }
  },

  /** wrAuth API maximum page size for /data/:table list endpoints. */
  maxDataPageSize: 200,

  listDataRows: async <T>(
    table: string,
    accessToken: string,
    query: WrAuthDataListQuery = {}
  ): Promise<WrAuthDataListResult<T>> => {
    const params = new URLSearchParams();
    const limit = Math.min(Math.max(query.limit ?? 200, 1), 200);
    params.set('limit', String(limit));
    params.set('page', String(query.page ?? 1));
    if (query.sort) {
      params.set('sort', query.sort);
    }
    if (query.order) {
      params.set('order', query.order);
    }
    return authRequest<WrAuthDataListResult<T>>({
      path: `/data/${table}?${params.toString()}`,
      method: 'GET',
      accessToken,
    });
  },

  listAllDataRows: async <T>(
    table: string,
    accessToken: string,
    query: Omit<WrAuthDataListQuery, 'limit' | 'page'> = {}
  ): Promise<T[]> => {
    const pageSize = 200;
    const allRows: T[] = [];
    let page = 1;

    while (true) {
      const result = await wrAuthClient.listDataRows<T>(table, accessToken, {
        ...query,
        limit: pageSize,
        page,
      });
      const rows = result.rows ?? [];
      allRows.push(...rows);

      if (rows.length < pageSize) {
        break;
      }
      if (result.total !== undefined && allRows.length >= result.total) {
        break;
      }

      page += 1;
      if (page > 50) {
        if (__DEV__) {
          console.warn(`[wrAuth] Stopped paging ${table} after 50 pages (${allRows.length} rows).`);
        }
        break;
      }
    }

    return allRows;
  },

  createDataRow: async <T>(table: string, accessToken: string, body: Record<string, unknown>) => {
    return authRequest<{ row: T }>({
      path: `/data/${table}`,
      method: 'POST',
      accessToken,
      body,
    });
  },

  updateDataRow: async <T>(
    table: string,
    accessToken: string,
    id: string,
    body: Record<string, unknown>
  ) => {
    return authRequest<{ row: T }>({
      path: `/data/${table}/${id}`,
      method: 'PATCH',
      accessToken,
      body,
    });
  },

  deleteDataRow: (table: string, accessToken: string, id: string) =>
    authRequest<void>({
      path: `/data/${table}/${id}`,
      method: 'DELETE',
      accessToken,
    }),

  createStorageObject: (
    accessToken: string,
    body: {
      purpose: 'avatar' | 'progress_photo' | 'photo_vault_key';
      content_type: string;
      data_base64: string;
    }
  ) =>
    authRequest<{
      object: {
        id: string;
        purpose: string;
        content_type: string;
        byte_size: number;
      };
    }>({
      path: '/storage/objects',
      method: 'POST',
      accessToken,
      body,
    }).then(result => result.object),

  downloadStorageObject: async (accessToken: string, storageRef: string): Promise<string> => {
    if (!isWrAuthStorageRef(storageRef)) {
      throw new WrAuthRequestError(400, 'INVALID_STORAGE_REF', 'Invalid storage reference');
    }
    const objectId = parseWrAuthStorageRef(storageRef);
    const headers: Record<string, string> = {
      'X-App-Key': wrauthAppKey,
      Authorization: `Bearer ${accessToken}`,
    };
    const response = await fetch(`${wrauthApiUrl}/storage/objects/${objectId}`, { headers });
    if (!response.ok) {
      const apiError = await parseError(response);
      throw apiError;
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    if (typeof btoa === 'function') {
      return btoa(binary);
    }
    const { bytesToBase64 } = await import('@/utils/bytes-base64');
    return bytesToBase64(bytes);
  },

  deleteStorageObject: (accessToken: string, storageRef: string) => {
    if (!isWrAuthStorageRef(storageRef)) {
      return Promise.resolve();
    }
    const objectId = parseWrAuthStorageRef(storageRef);
    return authRequest<void>({
      path: `/storage/objects/${objectId}`,
      method: 'DELETE',
      accessToken,
    });
  },

  isSessionTokens,
};
