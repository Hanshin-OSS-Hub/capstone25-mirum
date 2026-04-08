import { errorResponse, parseUsername, successResponse } from '../common.js';
import { projectsDB } from '../projects/model.js';
import { usersDB } from '../users/model.js';
import { invitationsDB } from '../invitations/model.js';
import { http } from 'msw';

export const memberHandlers = [
  // [GET] 프로젝트 멤버 목록 조회
  http.get('*/api/projects/:projectId/members', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    const { projectId } = params;
    const project = projectsDB.find((p) => p.projectId === Number(projectId));

    if (!project || project.isDeleted) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);

    const isMember = project.members.some((m) => m.username === username);
    if (!isMember) return errorResponse('프로젝트 접근 권한이 없습니다.', 403);

    console.log(`MSW: 프로젝트 멤버 목록 조회 (projectId: ${projectId})`, project.members);
    return successResponse(project.members, 200);
  }),

  // [POST] 새 멤버 초대
  http.post('*/api/projects/:projectId/members/invite', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    const { projectId } = params;
    const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));

    if (projectIndex === -1 || projectsDB[projectIndex].isDeleted) {
      return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    }

    const member = projectsDB[projectIndex].members.find((m) => m.username === username);
    if (!member || member.role !== 'LEADER') {
      return errorResponse('초대 권한이 없습니다.', 403);
    }

    const { invitedUsername } = await request.json();

    const invitedUser = usersDB.find((u) => u.username === invitedUsername);
    if (!invitedUser) return errorResponse('존재하지 않는 사용자입니다.', 404);

    const isAlreadyMember = projectsDB[projectIndex].members.some(
      (m) => m.username === invitedUsername,
    );
    if (isAlreadyMember) return errorResponse('이미 프로젝트 멤버입니다.', 400);

    const isAlreadyInvited = invitationsDB.some(
      (i) => i.projectId === Number(projectId) && i.invitedName === invitedUsername && i.status === 'INVITED'
    );

    if (isAlreadyInvited) return errorResponse('이미 초대 대기 중인 사용자입니다.', 400);

    const maxInviteId = invitationsDB.length > 0 ? Math.max(...invitationsDB.map((i) => i.inviteId)) : 0;

    const newInvitation = {
      inviteId: maxInviteId + 1,
      projectId: Number(projectId),
      projectName: projectsDB[projectIndex].projectName,
      inviterName: username,
      invitedName: invitedUsername,
      status: 'INVITED',
      createdAt: new Date().toISOString()
    };

    invitationsDB.push(newInvitation);

    console.log(`MSW: 멤버 초대 발송 (projectId: ${projectId}, to: ${invitedUsername})`, newInvitation);
    return successResponse(null, 200);
  }),

  // [DELETE] 프로젝트 멤버 강퇴
  http.delete('*/api/projects/:projectId/members/:memberUsername', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    const { projectId, memberUsername } = params;
    const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));

    if (projectIndex === -1 || projectsDB[projectIndex].isDeleted) {
      return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    }

    const member = projectsDB[projectIndex].members.find((m) => m.username === username);
    if (!member || member.role !== 'LEADER') {
      return errorResponse('멤버 추방 권한이 없습니다.', 403);
    }

    if (username === memberUsername) {
       return errorResponse('자신을 강퇴할 수 없습니다. 프로젝트 나가기를 이용해주세요.', 400);
    }

    const targetMemberIndex = projectsDB[projectIndex].members.findIndex(
      (m) => m.username === memberUsername,
    );

    if (targetMemberIndex === -1) {
       return errorResponse('해당 사용자는 프로젝트 멤버가 아닙니다.', 404);
    }

    projectsDB[projectIndex].members.splice(targetMemberIndex, 1);
    projectsDB[projectIndex].memberCount -= 1;

    console.log(`MSW: 멤버 강퇴 처리 (projectId: ${projectId}, target: ${memberUsername})`);
    return successResponse(null, 200);
  }),

  // [DELETE] 프로젝트 나가기
  http.delete('*/api/projects/:projectId/members/leave', ({ params, request }) => {
     const authHeader = request.headers.get('Authorization');
     if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

     const token = authHeader.split(' ')[1];
     const username = parseUsername(token);

     const { projectId } = params;
     const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));

     if (projectIndex === -1 || projectsDB[projectIndex].isDeleted) {
       return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
     }

     const targetMemberIndex = projectsDB[projectIndex].members.findIndex(
       (m) => m.username === username,
     );

     if (targetMemberIndex === -1) {
        return errorResponse('프로젝트 멤버가 아닙니다.', 403);
     }

     const isLeader = projectsDB[projectIndex].members[targetMemberIndex].role === 'LEADER';

     if (isLeader) {
       return errorResponse('프로젝트 리더는 나갈 수 없습니다. 프로젝트를 삭제하거나 리더 권한을 위임하세요.', 400);
     }

     projectsDB[projectIndex].members.splice(targetMemberIndex, 1);
     projectsDB[projectIndex].memberCount -= 1;

     console.log(`MSW: 프로젝트 나가기 완료 (projectId: ${projectId}, user: ${username})`);
     return successResponse(null, 200);
  })
];
