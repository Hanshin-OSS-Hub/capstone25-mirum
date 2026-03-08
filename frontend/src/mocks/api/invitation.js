import { http } from "msw";
import { successResponse, errorResponse, parseUsername } from "@/mocks/api/common.js";
import { database } from "@/mocks/database.js";

export const invitationHandlers = [
    /** {@link useGetInvitees} */
    // [Get] 프로젝트별 보낸 초대 목록 조회 (관리자용)
    http.get('*/api/invitations/sent/:projectId', ({ params, request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }
      
      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);
      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401
            );
      }
      
      // 프로젝트가 존재하는지 확인
      const { projectId } = params;
      const project = database.projects.find(p => p.projectId === Number(projectId));
      if (!project) {
        return errorResponse(
            'Project not found',
            404,
        );
      }
      // 프로젝트별 초대 목록 필터링
      const invitationList = database.invitations.filter(i =>
          i.projectId === Number(projectId)
          && i.status === 'INVITED'
      );

      console.log('MSW: 프로젝트별 보낸 초대 목록 조회');
      return successResponse(
          invitationList,
          200,
      );
    }),

    /** {@link useGetInviteList} */
    // [Get] 내가 받은 초대 목록 조회
    http.get('*/api/invitations/received', ({ request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);
      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      // 수정: 내가 받은 초대(invitedName)만 필터링
      const invitationList = database.invitations.filter(i => 
          i.invitedName === userData.username && i.status === 'INVITED'
      );
      
      console.log('MSW: 내가 받은 초대 목록 조회');
      return successResponse(
          invitationList,
          200,
      );
    }),

    /** {@link useAcceptInvitation} */
    // [Post] 프로젝트 초대 수락
    http.post('*/api/invitations/:inviteId/accept', async ({ params, request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);
      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }
      
      // 초대가 존재하는지 확인
      const { inviteId } = params;
      const invitation = database.invitations.find(i => i.inviteId === Number(inviteId));
      if (!invitation) {
        return errorResponse(
            'Invitation not found',
            404,
        );
      }
      // 초대를 발송한 프로젝트가 존재하는지 확인
      const project = database.projects.find(p => p.projectId === invitation.projectId);
      if (!project) {
        return errorResponse(
            'Project not found',
            404,
        );
      }
      // 초대 받은 사용자가 존재하는지 확인
      const user = database.users.find(u => u.username === invitation.invitedName);
      if (!user) {
        return errorResponse(
            'User not found',
            404,
        );
      }
      // 이미 멤버인지 확인
      if (project.members.some(m => m.username === user.username)) {
        return errorResponse(
            'Member already exists',
            409,
        );
      }
      // 멤버 추가
      project.members.push({
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        role: 'MEMBER'
      });

      // 초대 상태 변경 (ACCEPTED)
      invitation.status = 'ACCEPTED';

      console.log(`MSW: 프로젝트 초대 수락 성공 (프로젝트 ID: ${invitation.projectId}) 유저 ID: ${user.id})`);
      return successResponse(
          null,
          200,
      );
    }),

    /** {@link useDeclineInvitation} */
    // [Put] 프로젝트 초대 거절
    http.put('*/api/invitations/:inviteId/decline', async ({ params, request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }
      
      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);
      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      const { inviteId } = params;
      const invitation = database.invitations.find(i => i.inviteId === Number(inviteId));
      if (!invitation) {
        return errorResponse(
            'Invitation not found',
            404,
        );
      }
      // 초대를 발송한 프로젝트가 존재하는지 확인
      const project = database.projects.find(p => p.projectId === invitation.projectId);
      if (!project) {
        return errorResponse(
            'Project not found',
            404,
        );
      }
      // 초대 받은 사용자가 존재하는지 확인
      const user = database.users.find(u => u.username === invitation.invitedName);
      if (!user) {
        return errorResponse(
            'User not found',
            404,
        );
      }
      // 초대 상태 변경 (DECLINED)
      invitation.status = 'DECLINED';

      console.log(`MSW: 프로젝트 초대 거절 성공 (프로젝트 ID: ${invitation.projectId}) 유저 ID: ${user.id})`);
      return successResponse(
          null,
          200,
      );
    }),
];