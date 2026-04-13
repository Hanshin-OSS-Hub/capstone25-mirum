import { processToken } from '@/mocks/domains/api/tokenHandlers.js';
import { http } from 'msw';
import { errorResponse, successResponse } from '../common.js';
import { invitationsDB } from '../model/inviteDataModel.js';

/** @typedef {import('@/types/invitation.js').Invitation} Invitation */

export const invitationHandlers = [
  // [GET] 받은 초대 목록 조회
  http.get('*/api/invitations/received', ({ request }) => {
    const authResult = processToken(request);
    if ('status' in authResult && authResult.status >= 400) return authResult;

    /** @type {{ username: string }} */
    const user = authResult;

    const myInvitations = invitationsDB.filter(
      /** @param {Invitation} invitation */
      (invitation) => invitation.invitedName === user.username,
    );

    console.log(`MSW: 받은 초대 목록 조회 (username: ${user.username})`, myInvitations);
    return successResponse(myInvitations, 200);
  }),

  // [GET] 특정 프로젝트에서 보낸 초대 목록 조회
  http.get('*/api/invitations/sent/:projectId', ({ params, request }) => {
    const authResult = processToken(request);
    if ('status' in authResult && authResult.status >= 400) return authResult;

    const { projectId } = params;
    const id = Number(projectId);

    const sentInvitations = invitationsDB.filter(
      /** @param {Invitation} invitation */
      (invitation) => invitation.projectId === id,
    );

    console.log(`MSW: 발신 초대 목록 조회 (projectId: ${id})`, sentInvitations);
    return successResponse(sentInvitations, 200);
  }),

  // [POST] 초대 수락
  http.post('*/api/invitations/:inviteId/accept', ({ params, request }) => {
    const authResult = processToken(request);
    if ('status' in authResult && authResult.status >= 400) return authResult;

    /** @type {{ username: string }} */
    const user = authResult;

    const { inviteId } = params;
    const inviteIndex = invitationsDB.findIndex((i) => i.inviteId === Number(inviteId));

    if (inviteIndex === -1) {
      return errorResponse('유효하지 않은 초대입니다.', 400);
    }

    if (invitationsDB[inviteIndex].invitedName !== user.username) {
      return errorResponse('초대 수락 권한이 없습니다.', 403);
    }

    invitationsDB[inviteIndex].status = 'ACCEPTED';
    invitationsDB[inviteIndex].responseDate = new Date().toISOString();

    console.log(`MSW: 초대 수락 (inviteId: ${inviteId})`);
    return successResponse(null, 200);
  }),

  // [PUT] 초대 거절
  http.put('*/api/invitations/:inviteId/decline', ({ params, request }) => {
    const authResult = processToken(request);
    if ('status' in authResult && authResult.status >= 400) return authResult;

    /** @type {{ username: string }} */
    const user = authResult;

    const { inviteId } = params;
    const inviteIndex = invitationsDB.findIndex((i) => i.inviteId === Number(inviteId));

    if (inviteIndex === -1) {
      return errorResponse('유효하지 않은 초대입니다.', 400);
    }

    if (invitationsDB[inviteIndex].invitedName !== user.username) {
      return errorResponse('초대 거절 권한이 없습니다.', 403);
    }

    invitationsDB[inviteIndex].status = 'DECLINED';
    invitationsDB[inviteIndex].responseDate = new Date().toISOString();

    console.log(`MSW: 초대 거절 (inviteId: ${inviteId})`);
    return successResponse(null, 200);
  }),
];
