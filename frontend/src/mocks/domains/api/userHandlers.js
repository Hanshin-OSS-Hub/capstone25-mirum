import { processToken } from '@/mocks/domains/api/tokenHandlers.js';
import { errorResponse, successResponse } from '@/mocks/domains/common.js';
import { projectsDB } from '@/mocks/domains/model/projectDataModel.js';
import { usersDB } from '@/mocks/domains/model/userDataModel.js';
import { http } from 'msw';

/**
 * @typedef {import('@/types/user.js').UserData} UserData
 */

export const userHandlers = [
  /** {@link Login} */
  // [POST] 회원가입
  http.post('*/api/user', async ({ request }) => {
    /** @type { UserData } */
    const signupRequest = await request.json();

    const user = usersDB.some((u) => u.username === signupRequest.username);
    if (user) return errorResponse('이미 존재하는 계정입니다.', 409);

    const newUser = {
      role: 'USER',
      ...signupRequest,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      profileImg: '',
    };

    usersDB.push(newUser);

    return successResponse({ username: signupRequest.username }, 201);
  }),

  // [PUT] 비밀번호 변경
  http.put('*/api/user/password', async ({ request }) => {
    const { currentPassword, newPassword } = await request.json();
    const loginUserData = processToken(request);
    const index = usersDB.findIndex((u) => u.username === loginUserData.username);
    if (index === -1) return errorResponse('유효하지 않은 사용자입니다.', 401);
    if (usersDB[index].password !== currentPassword) {
      return errorResponse('현재 비밀번호가 일치하지 않습니다.', 400);
    } else {
      usersDB[index].password = newPassword;
      usersDB[index].updatedDate = new Date().toISOString();

      return successResponse(null);
    }
  }),

  /** {@link Login} */
  // [GET] 로그인 유저 정보 조회
  http.get('*/api/user', ({ request }) => {
    const loginUserData = processToken(request);
    // 비밀번호는 일부러 제외하고 반환 (비정상적인 방법으로 새 비밀번호가 입력되더라도 무시)
    const { password, ...userInfo } = loginUserData;
    return successResponse(userInfo, 200);
  }),

  /** {@link AuthProvider} */
  // [PUT] 로그인 유저 정보 수정
  http.put('*/api/user', async ({ request }) => {
    const updateData = await request.json();
    const loginUserData = processToken(request);

    const index = usersDB.findIndex((u) => u.username === loginUserData.username);
    if (index === -1) return errorResponse('유효하지 않은 사용자입니다.', 401);
    // 비밀번호는 일부러 제외하고 반환 (비정상적인 방법으로 새 비밀번호가 입력되더라도 무시)
    const { password, ...safeUpdateData } = updateData;

    usersDB[index] = {
      ...usersDB[index],
      ...safeUpdateData,
      updatedDate: new Date().toISOString(),
    };

    return successResponse({ username: usersDB[index].username }, 200);
  }),

  /** {@link AuthProvider} */
  // [DELETE] 회원탈퇴
  http.delete('*/api/user', async ({ request }) => {
    const loginUserData = processToken(request);
    const joinedProjects = projectsDB.filter((p) =>
      p.members.some((m) => m.username === loginUserData.username),
    );

    if (joinedProjects.length > 0) {
      return errorResponse(
        `참여 중인 프로젝트가 있어 탈퇴할 수 없습니다. 먼저 프로젝트에서 나가주세요.`,
        409,
      );
    }

    const index = usersDB.findIndex((u) => u.username === loginUserData.username);
    if (index === -1) return errorResponse('유효하지 않은 사용자입니다.', 401);

    usersDB.splice(index, 1);

    return successResponse(null, 200);
  }),
];
