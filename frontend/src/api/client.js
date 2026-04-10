/**
 * API 요청을 위한 중앙 클라이언트.
 * - 자동으로 Authorization 헤더에 AccessToken을 추가합니다.
 * - API 요청이 401 에러로 실패 시, RefreshToken으로 AccessToken을 자동 재발급하고 원래 요청을 재시도합니다.
 *
 * --- 다른 파일에서 사용하는 방법 ---
 * import { api } from './src/api/client.js';
 *
 * async function getUserProfile() {
 *   try {
 *     const userData = await api.get("/me"); // 헤더를 신경 쓸 필요가 없습니다!
 *     console.log(userData);
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 */

const BASE_URL = import.meta.env.VITE_API_URL;
let refreshPromise = null;  // 리프레시 토큰 갱신 요청을 전역으로 관리하기 위한 프로미스 변수
let isSessionExpired = false;  // 이미 로그인 만료 처리가 되었는지 확인하는 플래그

export function client(endpoint, options={}) {
  const fetchWithAuth = async (isRetry = false) => {
    // api 함수 호출 시 option 파라미터로 header 작성
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    // header에 accessToken (있다면) 삽입
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken)
      headers["Authorization"] = `Bearer ${accessToken}`;
    // 로컬 테스트 및 배포 환경 주소 자동 스위칭
    const url = endpoint.startsWith("http")
        ? endpoint
        : `${BASE_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    // 요청 전송
    const response = await fetch(url, {...options, headers});

    // 토큰 재발급 로직
    if (response.status === 401 && !isRetry) {
      try {
        // 이미 세션 만료 처리가 끝났다면 즉시 에러 반환 (중복 진입 방지)
        if (isSessionExpired)
          return Promise.reject("Session Expired");

        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken)
          throw new Error("No refresh token");

        // 아무도 토큰 재발급을 진행하지 않은 경우
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshResponse = await fetch(`${BASE_URL}/jwt/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok)
              throw new Error("토큰 재발급에 실패했습니다.");
              window.dispatchEvent(new CustomEvent("openLoginModal"));

            const newTokenData = await refreshResponse.json();
            localStorage.setItem("accessToken", newTokenData.accessToken)
            localStorage.setItem("refreshToken", newTokenData.refreshToken);
          })();
        }

        // 진행 중인 토큰 재발급(갱신)이 완료될 때까지 대기
        await refreshPromise;

        // 원래 실패했던 API 요청을 새로운 토큰으로 다시 시도 (isRetry = true)
        return await fetchWithAuth(true);
      } catch (refreshError) {
        if (isSessionExpired)
          return Promise.reject(refreshError);

        isSessionExpired = true;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.dispatchEvent(new CustomEvent("openLoginModal"))

        throw new Error("Session expired");
      } finally {
        // ✅ 성공하든 실패하든 무조건 여기서 비운다.
        // 다른 대기자(B, C)들은 이미 이 Promise 객체를 참조하고 있으므로
        // 여기서 변수를 null로 바꿔도 그들은 안전하게 결과를 받음.
        refreshPromise = null;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API Error: ${response.statusText}`);
    }

    if (response.status === 204)
      return null;

    const contentType = response.headers.get("content-type");
    // 1차 분기: 응답이 JSON 형식인가
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      // 2차 분기: response DTO 형식인가
      if (result && typeof result === "object" && "success" in result && "data" in result) {
        // 3차 분기: 내부 로직에 의해 요청이 성공적으로 처리되었는가
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.message || "API 요청 실패");
        }
        // 표준 포맷이 아니면(외부 API 등) 그냥 원본 반환 (유연성 확보)
      } else {
        return result;
        }
        // JSON이 아닌 경우 (텍스트 등) -> 버리지 말고 읽어서 반환
      } else {
        return response.text();
    }
  }
  return fetchWithAuth();
}

export const api = {
  get: (endpoint, options = {}) => client(endpoint, { method: "GET", ...options }),

  post: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : JSON.stringify(body);
    const processedHeaders = isFormData
        ? { "Content-Type": undefined, ...options.headers }
        : options.headers;

    return client(endpoint, {
      method: "POST",
      body: processedBody,
      ...options,
      headers: processedHeaders,
    })
  },

  put: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : JSON.stringify(body);
    const processedHeaders = isFormData
        ? { "Content-Type": undefined, ...options.headers }
        : options.headers;

    return client(endpoint, {
      method: "PUT",
      body: processedBody,
      ...options,
      headers: processedHeaders,
    })
  },

  delete: (endpoint, options = {}) => client(endpoint, { method: "DELETE", ...options }),

  patch: (endpoint, body, options = {}) => {
    const isFormData = body instanceof FormData;
    const processedBody = isFormData ? body : JSON.stringify(body);
    const processedHeaders = isFormData
        ? { "Content-Type": undefined, ...options.headers }
        : options.headers;

    return client(endpoint, {
      method: "PATCH",
      body: processedBody,
      ...options,
      headers: processedHeaders,
    })
  }
}