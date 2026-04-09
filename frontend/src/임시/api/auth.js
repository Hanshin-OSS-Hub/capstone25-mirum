import { client } from '@/api/client.js';
import AuthProvider from '@/features/auth/context/AuthContext.jsx';
import { http } from 'msw';
import Login from '../../features/auth/components/Login.jsx';
import Signup from '../../features/auth/components/Signupmodal.jsx';
import { database } from '../../mocks/database.js';
import { errorResponse, successResponse } from './common.js';
import { createToken, parseUsername } from './common.js';

export const authHandlers = [
  /** {@link Login} */
  // [GET] 로그인 유저 정보 조회
  http.get('*/api/user', ({ request }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('로그인이 필요합니다.', 401);
    }

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const user = database.users.find((u) => u.username === username);

    if (user) {
      // 비밀번호는 제외하고 반환 (비정상적인 방법으로 새 비밀번호가 입력되더라도 무시)
      const { password, ...userInfo } = user;
      return successResponse(userInfo, 200);
    } else {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }
  }),

  /** {@link Login} */
  // [POST] 로그인
  http.post('*/api/login', async ({ request }) => {
    const { username, password } = await request.json();
    const user = database.users.find((u) => u.username === username && u.password === password);
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

  /** {@link AuthProvider} */
  // [POST] 로그아웃 (선택 사항)
  // 보통 로그아웃은 POST 메서드를 많이 사용합니다.
  http.post('*/api/logout', () => {
    return successResponse(null);
  }),

  /** {@link Signup} */
  // [POST] 회원가입
  http.post('*/api/user', async ({ request }) => {
    const newUserRequest = await request.json();

    if (database.users.some((u) => u.username === newUserRequest.username)) {
      return errorResponse('이미 존재하는 계정입니다.', 409);
    }

    // ID 생성 전략 개선: Max ID + 1
    const maxId = database.users.length > 0 ? Math.max(...database.users.map((u) => u.id)) : 0;

    const newUser = {
      id: maxId + 1,
      role: 'USER',
      ...newUserRequest,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      profileImg: '',
    };

    database.users.push(newUser);
    return successResponse({ userId: newUser.id }, 201);
  }),

  // [PUT] 비밀번호 변경 (미구현)
  http.put('*/api/user/password', async ({ request }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const { currentPassword, newPassword } = await request.json();
    const index = database.users.findIndex((u) => u.username === username);

    if (index === -1) {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }

    // 현재 비밀번호 검증
    if (database.users[index].password !== currentPassword) {
      return errorResponse('현재 비밀번호가 일치하지 않습니다.', 400);
    }

    // 비밀번호 변경
    database.users[index].password = newPassword;
    database.users[index].updatedDate = new Date().toISOString();

    return successResponse(null);
  }),

  /** {@link AuthProvider} */
  // [PUT] 로그인 유저 정보 수정
  http.put('*/api/user', async ({ request }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const updateData = await request.json();
    const index = database.users.findIndex((u) => u.username === username);

    if (index !== -1) {
      // 1. updateData에서 password 속성 제거
      const { password, ...safeUpdateData } = updateData;

      // 2. 비밀번호를 제외한 나머지 정보만 업데이트
      database.users[index] = {
        ...database.users[index],
        ...safeUpdateData,
        updatedDate: new Date().toISOString(),
      };

      return successResponse({ userId: database.users[index].id }, 200);
    }

    return errorResponse('유효하지 않은 사용자입니다.', 401);
  }),

  /** {@link AuthProvider} */
  // [DELETE] 회원탈퇴
  http.delete('*/api/user', async ({ request }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const joinedProjects = database.projects.filter((p) =>
      p.members.some((m) => m.username === username),
    );

    if (joinedProjects.length > 0) {
      return errorResponse(
        `참여 중인 프로젝트가 있어 탈퇴할 수 없습니다. 먼저 프로젝트에서 나가주세요.`,
        409, // Conflict (상태 충돌)
      );
    }
    const index = database.users.findIndex((u) => u.username === username);
    if (index !== -1) {
      // users = users.filter(u => u.username !== username);
      database.users.splice(index, 1);
      return successResponse(null, 200);
    }
    return errorResponse('회원탈퇴 실패', 401);
  }),

  /** {@link client} */
  // [POST] 토큰 재발급
  http.post('*/api/jwt/refresh', async ({ request }) => {
    const { refreshToken } = await request.json();
    //  username 추출
    const username = parseUsername(refreshToken);
    // 간단한 검증 로직
    if (database.users.some((u) => u.username === username)) {
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
