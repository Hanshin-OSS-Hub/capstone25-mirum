/**
 * API 요청을 위한 중앙 클라이언트.
 * - 자동으로 Authorization 헤더에 AccessToken을 추가합니다.
 * - API 요청이 401 에러로 실패 시, RefreshToken으로 AccessToken을 자동 재발급하고 원래 요청을 재시도합니다.
 */
export async function apiClient(endpoint, options = {}) {
  const fetchWithAuth = async (isRetry = false) => {
    const accessToken = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${endpoint}`, {
      ...options,
      headers,
    });

    // 1. AccessToken 만료 시 (401) 그리고 재시도 요청이 아닐 때
    if (response.status === 401 && !isRetry) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // 2. 토큰 재발급 API 호출
        const refreshResponse = await fetch(`jwt/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh token");
        }

        const { accessToken: newAccessToken } = await refreshResponse.json();

        // 3. 새로 받은 토큰을 localStorage에 저장
        localStorage.setItem("accessToken", newAccessToken);

        // 4. 원래 실패했던 API 요청을 새로운 토큰으로 다시 시도 (isRetry 플래그와 함께)
        return await fetchWithAuth(true);

      } catch (refreshError) {
        // 5. 리프레시 실패 시, 토큰을 삭제하고 로그인 페이지로 유도
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // 필요하다면 로그인 페이지로 리디렉션
        // window.location.href = '/login'; 
        throw new Error("Session expired. Please log in again.");
      }
    }

    // 일반적인 에러 처리
    if (!response.ok) {
      // 서버에서 보낸 JSON 에러 메시지를 파싱 시도
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API Error: ${response.statusText}`);
    }

    // 성공적인 응답의 JSON 본문을 반환
    // 응답 본문이 없는 경우(e.g., 204 No Content)를 대비하여 확인
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      if (result && typeof result === "object" && "success" in result && "data" in result) {
        if (result.success) {
          return result.data;
        } else {
          // 서버가 success: false를 반환한 경우
          throw new Error(result.message || "API 요청 실패");
        }
      } else {
        return result;
      }
    } else {
      return; // 본문이 없으면 undefined 반환
    }
  };

  return fetchWithAuth();
}

export const api = {
  get: (endpoint) => apiClient(endpoint),
  post: (endpoint, body) => apiClient(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) => apiClient(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => apiClient(endpoint, { method: "DELETE" }),
};

// --- 다른 파일에서 사용하는 방법 ---
// import { api } from './src/api/client.js';
//
// async function getUserProfile() {
//   try {
//     const userData = await api.get("/me"); // 헤더를 신경 쓸 필요가 없습니다!
//     console.log(userData);
//   } catch (error) {
//     console.error(error);
//   }
// }
