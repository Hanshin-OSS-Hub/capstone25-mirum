/**
 * API 요청을 위한 중앙 클라이언트.
 * - 자동으로 Authorization 헤더에 AccessToken을 추가합니다.
 * - API 요청이 401 에러로 실패 시, RefreshToken으로 AccessToken을 자동 재발급하고 원래 요청을 재시도합니다.
 */
import axios from 'axios';

/**
 * @template T
 * @typedef {import('@/types/common.js').ApiResponse<T>} ApiResponse
 */

const BASE_URL = import.meta.env.VITE_API_URL;
let refreshPromise = null; // 리프레시 토큰 갱신 요청을 전역으로 관리하기 위한 프로미스 변수
let isSessionExpired = false; // 이미 로그인 만료 처리가 되었는지 확인하는 플래그

const markSessionExpired = () => {
  if (isSessionExpired) return;
  isSessionExpired = true;
  const currentPath = `${window.location.pathname || ''}${window.location.search || ''}${window.location.hash || ''}`;
  if (currentPath && currentPath !== '/') {
    sessionStorage.setItem('postLoginRedirect', currentPath);
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new CustomEvent('openLoginModal'));
};

/**
 * API 에러 객체를 표준화해 생성합니다.
 * @param {string} message
 * @param {number} [status]
 * @param {unknown} [payload]
 */
const createApiError = (message, status, payload) => {
  const error = new Error(message);
  error.name = 'ApiError';
  if (typeof status === 'number') {
    // @ts-ignore custom property
    error.status = status;
  }
  // @ts-ignore custom property
  error.payload = payload;
  return error;
};

const axiosClient = axios.create({
  baseURL: BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const normalizeData = (responseData, status) => {
  if (status === 204) return null;
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    'data' in responseData
  ) {
    if (responseData.success) {
      return responseData.data;
    }
    throw createApiError(
      responseData.detail || responseData.message || 'API 요청 실패',
      status,
      responseData,
    );
  }
  return responseData;
};

const toApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message =
      payload?.message ||
      payload?.detail ||
      error.message ||
      (status ? `API Error: ${status}` : '요청 처리 중 오류가 발생했습니다.');
    return createApiError(message, status, payload);
  }
  if (error instanceof Error) return error;
  return createApiError('요청 처리 중 오류가 발생했습니다.');
};

/**
 * API 요청 클라이언트
 * @template T
 * @param {string} endpoint - API 엔드포인트
 * @param {{
 *  method?: string,
 *  headers?: Record<string, string | undefined>,
 *  body?: any,
 *  _retry?: boolean
 * }} [options]
 * @returns {Promise<T>}
 */
export async function client(endpoint, options = {}) {
  const method = String(options.method || 'GET').toLowerCase();
  const headers = { ...(options.headers || {}) };
  const data = options.body;

  if (!(data instanceof FormData) && data !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await axiosClient.request({
      url: endpoint,
      method,
      headers,
      data,
    });
    // 정상 통신이 확인되면 만료 플래그를 해제합니다.
    isSessionExpired = false;
    return normalizeData(response.data, response.status);
  } catch (error) {
    const axiosError = axios.isAxiosError(error) ? error : null;
    const status = axiosError?.response?.status;
    const alreadyRetried = Boolean(options._retry);

    if (status === 401 && !alreadyRetried) {
      try {
        if (isSessionExpired) {
          throw createApiError('Session expired', 401);
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw createApiError('No refresh token', 401);

        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshResponse = await axios.post(
              `${BASE_URL}/api/jwt/refresh`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } },
            );

            const tokenData = normalizeData(refreshResponse.data, refreshResponse.status);
            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);
            // 재발급 성공 시 세션 만료 상태를 복구합니다.
            isSessionExpired = false;
          })();
        }

        await refreshPromise;
        return client(endpoint, { ...options, _retry: true });
      } catch {
        markSessionExpired();
        throw createApiError('Session expired', 401);
      } finally {
        refreshPromise = null;
      }
    }

    throw toApiError(error);
  }
}

export const api = {
  /**
   * GET 요청
   * @template T
   * @param {string} endpoint
   * @param {RequestInit} [options]
   * @returns {Promise<T>}
   */
  get: (endpoint, options = {}) => client(endpoint, { method: 'GET', ...options }),

  /**
   * POST 요청
   * @template T
   * @param {string} endpoint
   * @param {any} body
   * @param {RequestInit} [options]
   * @returns {Promise<T>}
   */
  post: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : body;
    const processedHeaders = isFormData
      ? { 'Content-Type': undefined, ...options.headers }
      : options.headers;

    return client(endpoint, {
      method: 'POST',
      body: processedBody,
      ...options,
      headers: processedHeaders,
    });
  },

  /**
   * PUT 요청
   * @template T
   * @param {string} endpoint
   * @param {any} body
   * @param {RequestInit} [options]
   * @returns {Promise<T>}
   */
  put: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : body;
    const processedHeaders = isFormData
      ? { 'Content-Type': undefined, ...options.headers }
      : options.headers;

    return client(endpoint, {
      method: 'PUT',
      body: processedBody,
      ...options,
      headers: processedHeaders,
    });
  },

  /**
   * DELETE 요청
   * @template T
   * @param {string} endpoint
   * @param {RequestInit} [options]
   * @returns {Promise<T>}
   */
  delete: (endpoint, options = {}) => client(endpoint, { method: 'DELETE', ...options }),

  /**
   * PATCH 요청
   * @template T
   * @param {string} endpoint
   * @param {any} body
   * @param {RequestInit} [options]
   * @returns {Promise<T>}
   */
  patch: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : body;
    const processedHeaders = isFormData
      ? { 'Content-Type': undefined, ...options.headers }
      : options.headers;

    return client(endpoint, {
      method: 'PATCH',
      body: processedBody,
      ...options,
      headers: processedHeaders,
    });
  },
};
