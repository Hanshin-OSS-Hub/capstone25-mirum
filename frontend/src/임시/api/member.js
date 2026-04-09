import { database } from '@/mocks/database.js';
import { errorResponse, successResponse } from '@/임시/api/common.js';
import { parseUsername } from '@/임시/api/common.js';
import { http } from 'msw';

export const memberHandlers = [
  /** {@link useGetMemberList} */
  // [GET] 멤버 목록 조회
  http.get('*/api/member/:projectId', ({ request, params }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('로그인이 필요합니다.', 401);
    }

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const userData = database.users.find((u) => u.username === username);

    if (!userData) {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }

    const { projectId } = params;
    const project = database.projects.find((p) => p.projectId === Number(projectId));
    if (project) {
      return successResponse(project.members, 200);
    } else {
      return errorResponse('Project not found', 404);
    }
  }),

  /** {@link useInviteMember} */
  // [POST] 멤버 초대/추가 (수락 시)
  http.post('*/api/invitations', async ({ request }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('로그인이 필요합니다.', 401);
    }

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const userData = database.users.find((u) => u.username === username);

    if (!userData) {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }
    const { projectId, invitedName } = await request.json();
    // 유효성 검사
    if (!projectId || !invitedName) {
      return errorResponse('Invalid invitation data', 400);
    }

    const project = database.projects.find((p) => p.projectId === Number(projectId));
    const user = database.users.find((u) => u.username === invitedName);
    // projectId가 일치하는 데이터가 없는 경우
    if (!project) {
      return errorResponse('Project not found', 404);
    }
    // username이 일치하는 데이터가 없는 경우
    if (!user) {
      return errorResponse('User not found', 404);
    }
    // 이미 멤버인지 확인
    if (project.members.some((m) => m.username === user.username)) {
      return errorResponse('Member already exists', 409);
    }
    // 멤버 추가
    project.members.push({
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      role: 'MEMBER',
    });
    return successResponse(null, 200);
  }),

  /** {@link useUpdateMemberRole} */
  // [PUT] 멤버 권한 수정
  http.put('*/api/member/:projectId/role', async ({ params, request }) => {
    const { projectId } = params;
    const { username, role } = await request.json();

    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('로그인이 필요합니다.', 401);
    }

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const requesterUsername = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const userData = database.users.find((u) => u.username === requesterUsername);

    if (!userData) {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }

    const project = database.projects.find((p) => p.projectId === Number(projectId));
    if (project) {
      const member = project.members.find((m) => m.username === username);
      if (member) {
        member.role = role;
        return successResponse(null, 200);
      } else {
        return errorResponse('Member not found', 404);
      }
    } else {
      return errorResponse('Project not found', 404);
    }
  }),

  /** {@link useDeleteMember} */
  // [DELETE] 멤버 방출/탈퇴
  http.delete('*/api/member/:projectId', async ({ request, params }) => {
    const { projectId } = params;
    // 쿼리 파라미터 추출
    const url = new URL(request.url);
    const targetName = url.searchParams.get('targetName');

    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('로그인이 필요합니다.', 401);
    }

    // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
    const userData = database.users.find((u) => u.username === username);

    if (!userData) {
      return errorResponse('유효하지 않은 사용자입니다.', 401);
    }

    const project = database.projects.find((p) => p.projectId === Number(projectId));
    if (project) {
      const index = project.members.findIndex((m) => m.username === targetName);
      if (index !== -1) {
        project.members.splice(index, 1);
        return successResponse(null, 200);
      } else {
        return errorResponse('Member not found', 404);
      }
    } else {
      return errorResponse('Project not found', 404);
    }
  }),
];
