// 공통 응답 래퍼 함수
import { HttpResponse } from "msw";

export const successResponse = (data, status) => {
  return HttpResponse.json({
    success: true,
    message: "성공",
    data: data
  }, { status });
};

export const errorResponse = (message, status = 400) => {
  return HttpResponse.json({
    success: false,
    message: message,
    data: null
  }, { status });
};

// 토큰 생성 헬퍼 함수 (타임스탬프 추가)
export const createToken = (username, type = 'access') => {
  return `mock-${type}-token-${username}-${Date.now()}`;
};

// 토큰 파싱 헬퍼 함수
export const parseUsername = (token) => {
  if (!token) return null;
  // "mock-access-token-user1-123456789" -> "user1"
  // const parts = token.split('-');
  // parts = ["mock", "access", "token", "user1", "123456789"]
  // username은 뒤에서 두 번째 요소 (타임스탬프 바로 앞)
  // 혹은 정규식 사용: /mock-.*-token-(.+)-\d+/

  // 더 안전한 방법: prefix 제거 후 split
  const body = token.replace(/mock-(access|refresh)-token-/, '');
  return body.split('-')[0];
};