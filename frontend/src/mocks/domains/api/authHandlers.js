import { createToken, parseUsername } from '@/mocks/domains/api/tokenHandlers.js';
import { errorResponse, successResponse } from '@/mocks/domains/common.js';
import { usersDB } from '@/mocks/domains/model/userDataModel.js';
import { http } from 'msw';

export const authHandlers = [
  /** {@link Login} */
  // [POST] 로그인
  http.post('*/api/login', async ({ request }) => {
    const { username, password } = await request.json();
    const user = usersDB.find((u) => u.username === username && u.password === password);
    if (!user) return errorResponse('아이디 또는 비밀번호가 일치하지 않습니다.', 401);
    else {
      return successResponse({
        accessToken: createToken(username, 'access'),
        refreshToken: createToken(username, 'refresh'),
      });
    }
  }),

  // (미구현) 토큰 만료 로직
  /** {@link AuthProvider} */
  // [POST] 로그아웃
  http.post('*/api/logout', () => {
    return successResponse(null);
  }),

  // [POST] 토큰 재발급
  http.post('*/api/jwt/refresh', async ({ request }) => {
    const { refreshToken } = await request.json();
    const username = parseUsername(refreshToken);
    const user = usersDB.some((u) => u.username === username);

    if (!user) return errorResponse('유효하지 않은 사용자입니다.', 401);

    return successResponse(
      {
        accessToken: createToken(username, 'access'),
        refreshToken: createToken(username, 'refresh'),
      },
      200,
    );
  }),
];
