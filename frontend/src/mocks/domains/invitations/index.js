import { errorResponse, parseUsername, successResponse } from '../common.js';
import { invitationsDB } from './model.js';
import { projectsDB } from '../projects/model.js';
import { usersDB } from '../users/model.js';
import { http } from 'msw';

export const invitationHandlers = [
  // [GET] 받은 초대 목록 조회
  http.get('*/api/invitations', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    const myInvitations = invitationsDB.filter(
      (invitation) => invitation.invitedName === username && invitation.status === 'INVITED',
    );

    console.log(`MSW: 받은 초대 목록 조회 (username: ${username})`, myInvitations);
    return successResponse(myInvitations, 200);
  }),

  // [POST] 초대 수락
  http.post('*/api/invitations/:inviteId/accept', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    const { inviteId } = params;
    const inviteIndex = invitationsDB.findIndex((i) => i.inviteId === Number(inviteId));

    if (inviteIndex === -1 || invitationsDB[inviteIndex].status !== 'INVITED') {
      return errorResponse('유효하지 않은 초대입니다.', 400);
    }

    if (invitationsDB[inviteIndex].invitedName !== username) {
      return errorResponse('초대 수락 권한이 없습니다.', 403);
    }

    const projectId = invitationsDB[inviteIndex].projectId;
    const projectIndex = projectsDB.findIndex((p) => p.projectId === projectId);

    if (projectIndex === -1 || projectsDB[projectIndex].isDeleted) {
      return errorResponse('존재하지 않거나 삭제된 프로젝트입니다.', 404);
    }

    const isAlreadyMember = projectsDB[projectIndex].members.some(
      (m) => m.username === username,
    );

    if (isAlreadyMember) {
      return errorResponse('이미 프로젝트 멤버입니다.', 400);
    }

    invitationsDB[inviteIndex].status = 'ACCEPTED';

    projectsDB[projectIndex].members.push({
      username: userData.username,
      nickname: userData.nickname,
      role: 'MEMBER',
    });
    projectsDB[projectIndex].memberCount += 1;

    console.log(`MSW: 초대 수락 (inviteId: ${inviteId})`);
    return successResponse(null, 200);
  }),

  // [POST] 초대 거절
  http.post('*/api/invitations/:inviteId/decline', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const { inviteId } = params;
    const inviteIndex = invitationsDB.findIndex((i) => i.inviteId === Number(inviteId));

    if (inviteIndex === -1 || invitationsDB[inviteIndex].status !== 'INVITED') {
      return errorResponse('유효하지 않은 초대입니다.', 400);
    }

    if (invitationsDB[inviteIndex].invitedName !== username) {
      return errorResponse('초대 거절 권한이 없습니다.', 403);
    }

    invitationsDB[inviteIndex].status = 'DECLINED';

    console.log(`MSW: 초대 거절 (inviteId: ${inviteId})`);
    return successResponse(null, 200);
  }),
];
