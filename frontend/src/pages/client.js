/**
 * API 요청을 위한 중앙 클라이언트.
 * - 자동으로 Authorization 헤더에 AccessToken을 추가합니다.
 * - API 요청이 401 에러로 실패 시, RefreshToken으로 AccessToken을 자동 재발급하고 원래 요청을 재시도합니다.
 */
// 리프레시 토큰 갱신 요청을 전역으로 관리하기 위한 프로미스 변수
let refreshPromise = null;

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

    const url = endpoint.startsWith("http") ? endpoint : `http://localhost:8080/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 1. AccessToken 만료 시 (401) 그리고 재시도 요청이 아닐 때
    if (response.status === 401 && !isRetry) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // ✅ 동시 다발적인 갱신 요청 방지 (Mutex 역할)
        if (!refreshPromise) {
            refreshPromise = (async () => {
                // 2. 토큰 재발급 API 호출
                const refreshResponse = await fetch(`http://localhost:8080/jwt/refresh`, {
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
                return newAccessToken;
            })();
        }

        // 진행 중인 갱신 요청이 완료될 때까지 대기
        await refreshPromise;

        // 4. 원래 실패했던 API 요청을 새로운 토큰으로 다시 시도 (isRetry 플래그와 함께)
        return await fetchWithAuth(true);

      } catch (refreshError) {
        // 5. 리프레시 실패 시, 토큰을 삭제하고 로그인 페이지로 유도
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        refreshPromise = null;
        // 필요하다면 로그인 페이지로 리디렉션
        // window.location.href = '/login'; 
        throw new Error("Session expired. Please log in again.");
      } finally {
         // 주의: 여기서 refreshPromise를 null로 초기화하면 안 됨 (동시 대기 중인 다른 요청들이 아직 await 중일 수 있음)
         // Promise가 resolve되면 대기하던 모든 await가 풀리고, 각각 fetchWithAuth(true)를 재실행함.
         // 다음 번 401 발생 시 새로운 refreshPromise가 생성되도록 해야 하지만, 
         // 여기서는 간단히 재시도 로직에 맡김.
         // 다만 아주 안전하게 하려면 일정 시간 후 풀거나 해야 하지만, 보통은 이대로 둬도 무방함 (성공했으므로)
         // 에러가 났을 때만 null 처리(위 catch 블록)하면 됨.
         // 하지만 성공 후 다음 401을 위해 초기화가 필요하긴 함.
         // 여기서는 동시성 제어가 핵심이므로, 일단 성공 시에는 초기화하지 않고 다음 사이클(재요청)이 성공하면 문제 없음.
         // 요청이 다 끝나고 언젠가 다시 401이 나면? 그때 refreshPromise가 남아있으면 안 됨.
         // 따라서 성공 시에도 초기화가 필요하지만, "모든 대기자가 깨어난 후" 해야 함.
         // JS는 단일 스레드 이벤트 루프이므로 await 이후 코드는 마이크로태스크 큐에 들어감.
         // 가장 깔끔한 건:
         if (refreshPromise) {
             refreshPromise.finally(() => { 
                 refreshPromise = null; 
             });
         }
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
