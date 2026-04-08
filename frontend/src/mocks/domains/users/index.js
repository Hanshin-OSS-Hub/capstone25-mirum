import { http } from 'msw';
import { errorResponse, successResponse } from '../common.js';
import { createToken, parseUsername } from '../common.js';
import { projectsDB } from '../projects/model.js';
import { usersDB } from './model.js';

export const userHandlers = [
  // [GET] 로그인 유저 정보 조회
  http.get('*/api/user', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('로그인이 필요합니다.', 401);
    }

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const user = usersDB.find((u) => u.username === username);

    if (user) {
      const { password, ...userInfo } = user;
      return successResponse(userInfo, 200);
    } else {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }
  }),

  // [POST] 로그인
  http.post('*/api/login', async ({ request }) => {
    const { username, password } = await request.json();
    const user = usersDB.find((u) => u.username === username && u.password === password);
    if (user) {
      return successResponse(
        {
          accessToken: createToken(username, 'access'),
          refreshToken: createToken(username, 'refresh'),
        },
        200,
      );
    } else {
      return errorResponse('아이디 또는 비밀번호가 일치하지 않습니다.', 401);
    }
  }),

  // [POST] 로그아웃
  http.post('*/api/logout', () => {
    return successResponse(null);
  }),

  // [POST] 회원가입
  http.post('*/api/user', async ({ request }) => {
    const newUserRequest = await request.json();

    if (usersDB.some((u) => u.username === newUserRequest.username)) {
      return errorResponse('이미 존재하는 계정입니다.', 409);
    }

    const newUser = {
      role: 'USER',
      ...newUserRequest,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      profileImg: '',
    };

    usersDB.push(newUser);
    return successResponse({ username: newUser.username }, 201);
  }),

  // [PUT] 비밀번호 변경
  http.put('*/api/user/password', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const { currentPassword, newPassword } = await request.json();
    const index = usersDB.findIndex((u) => u.username === username);

    if (index === -1) {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }

    if (usersDB[index].password !== currentPassword) {
      return errorResponse('현재 비밀번호가 일치하지 않습니다.', 400);
    }

    usersDB[index].password = newPassword;
    usersDB[index].updatedDate = new Date().toISOString();

    return successResponse(null);
  }),

  // [PUT] 로그인 유저 정보 수정
  http.put('*/api/user', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const updateData = await request.json();
    const index = usersDB.findIndex((u) => u.username === username);

    if (index !== -1) {
      const { password, ...safeUpdateData } = updateData;
      usersDB[index] = {
        ...usersDB[index],
        ...safeUpdateData,
        updatedDate: new Date().toISOString(),
      };
      return successResponse({ username: usersDB[index].username }, 200);
    }

    return errorResponse('유효하지 않은 사용자입니다.', 401);
  }),

  // [DELETE] 회원탈퇴
  http.delete('*/api/user', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const joinedProjects = projectsDB.filter((p) => p.members.some((m) => m.username === username));

    if (joinedProjects.length > 0) {
      return errorResponse(
        `참여 중인 프로젝트가 있어 탈퇴할 수 없습니다. 먼저 프로젝트에서 나가주세요.`,
        409,
      );
    }
    const index = usersDB.findIndex((u) => u.username === username);
    if (index !== -1) {
      usersDB.splice(index, 1);
      return successResponse(null, 200);
    }
    return errorResponse('회원탈퇴 실패', 401);
  }),

  // [POST] 토큰 재발급
  http.post('*/api/jwt/refresh', async ({ request }) => {
    const { refreshToken } = await request.json();
    const username = parseUsername(refreshToken);
    if (usersDB.some((u) => u.username === username)) {
      return successResponse(
        {
          accessToken: createToken(username, 'access'),
          refreshToken: createToken(username, 'refresh'),
        },
        200,
      );
    } else {
      return errorResponse('토큰 재발급 실패', 401);
    }
  }),
];
