import { createToken, parseUsername } from '@/mocks/domains/api/tokenHandlers.js';
import { errorResponse, successResponse } from '@/mocks/domains/common.js';
import { usersDB } from '@/mocks/domains/model/userDataModel.js';
import { http } from 'msw';

/**
 * 인증/인가 관련 MSW 핸들러 모음입니다.
 * - 로그인: POST /api/login
 * - 로그아웃: POST /api/logout
 * - 토큰 재발급: POST /api/jwt/refresh
 */
export const authHandlers = [
  /** {@link Login} */
  // [POST] 로그인
  http.post('*/api/login', async ({ request }) => {
    const { username, password } = await request.json();
    const user = usersDB.find((u) => u.username === username && u.password === password);
    if (!user) return errorResponse('아이디 또는 비밀번호가 일치하지 않습니다.', 401);

    return successResponse({
      accessToken: createToken(username, 'access'),
      refreshToken: createToken(username, 'refresh'),
    });
  }),

  // [POST] 로그아웃 (Mock에서는 토큰 무효화 없이 성공 응답만 반환) */
  http.post('*/api/logout', () => {
    return successResponse(null);
  }),

  // [POST] 토큰 재발급
  http.post('*/api/jwt/refresh', async ({ request }) => {
    const { refreshToken } = await request.json();
    const username = parseUsername(refreshToken);
    const exists = usersDB.some((u) => u.username === username);

    if (!exists) return errorResponse('유효하지 않은 사용자입니다.', 401);

    return successResponse(
      {
        accessToken: createToken(username, 'access'),
        refreshToken: createToken(username, 'refresh'),
      },
      200,
    );
  }),
];
