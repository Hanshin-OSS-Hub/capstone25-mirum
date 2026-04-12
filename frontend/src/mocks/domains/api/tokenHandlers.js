import { errorResponse } from '@/mocks/domains/common.js';
import { usersDB } from '@/mocks/domains/model/userDataModel.js';

export const processToken = (request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);
  // Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다.
  //  (JWT Payload 디코딩을 흉내 냄) - token으로 로그인 사용자 정보 조회 과정 생략
  const token = authHeader.split(' ')[1];
  const jwt = parseUsername(token);

  const user = usersDB.find((u) => u.username === jwt);

  if (!user) return errorResponse('유효하지 않은 사용자입니다.', 401);

  return user;
};

// 가짜 JWT 생성
export const createToken = (username, type = 'access') => {
  const payload = btoa(JSON.stringify({ username, type, exp: Date.now() + 3600000 }));
  return `mock.${payload}.signature`;
};

export const parseUsername = (token) => {
  try {
    if (!token) return null;
    if (token.startsWith('mock.')) {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)).username;
    }

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(paddedPayload)).username;
  } catch (error) {
    return null;
  }
};
