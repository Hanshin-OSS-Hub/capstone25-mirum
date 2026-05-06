import { processToken } from '@/mocks/domains/api/tokenHandlers.js';
import { http } from 'msw';
import { errorResponse, successResponse } from '../common.js';
import { projectsDB } from '../model/projectDataModel.js';

export const projectHandlers = [
  // [GET] 참여 중인 프로젝트 목록 조회
  http.get('*/api/projects', ({ request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const url = new URL(request.url);
    const isDeletedRequested = url.searchParams.get('deleted') === 'true';

    const myProjects = projectsDB.filter((project) => {
      if (isDeletedRequested) {
        // 삭제된 프로젝트: 멤버가 0명이고, 삭제한 사람이 나여야 함
        const isMemberEmpty =
          project.memberCount === 0 || !project.members || project.members.length === 0;
        const isDeletedByMe = project.deleteUsername === currentUser.username;
        return project.isDeleted && isMemberEmpty && isDeletedByMe;
      }

      // 활성 프로젝트: 내가 멤버로 포함되어 있어야 함
      return (
        !project.isDeleted &&
        project.members.some((member) => member.username === currentUser.username)
      );
    });

    return successResponse(myProjects, 200);
  }),

  // [GET] 프로젝트 상세 조회
  http.get('*/api/project/:projectId', ({ params, request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const { projectId } = params;
    const project = projectsDB.find((p) => p.projectId === Number(projectId));

    if (!project || project.isDeleted) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);

    const isMember = project.members.some((m) => m.username === currentUser.username);
    if (!isMember) return errorResponse('프로젝트 접근 권한이 없습니다.', 403);

    return successResponse(project, 200);
  }),

  // [POST] 새 프로젝트 생성
  http.post('*/api/projects', async ({ request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    // JSDoc 타입 단언(Type Assertion)을 사용하여 IDE 경고 해결
    const newProjectRequest =
      /** @type {import('@/features/projects/api/useCreateProject.js').CreateProjectRequestDTO} */ (
        await request.json()
      );

    const maxId = projectsDB.length > 0 ? Math.max(...projectsDB.map((p) => p.projectId)) : 0;
    const newProjectId = maxId + 1;

    const newProject = {
      projectId: newProjectId,
      projectName: newProjectRequest.projectName,
      description: newProjectRequest.description,
      taskProgress: 0,
      memberCount: 1,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      isDeleted: false,
      deleteUsername: null,
      members: [
        {
          username: currentUser.username,
          nickname: currentUser.nickname,
          role: 'LEADER',
        },
      ],
    };

    projectsDB.push(newProject);
    return successResponse({ projectId: newProjectId }, 201);
  }),

  // [PUT] 프로젝트 수정
  http.put('*/api/projects/:projectId', async ({ params, request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const { projectId } = params;

    // JSDoc 타입 단언(Type Assertion)을 사용하여 IDE 경고 해결
    const updateRequest =
      /** @type {import('@/features/projects/api/useUpdateProject.js').UpdateProjectRequestDTO} */ (
        await request.json()
      );

    const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));
    if (projectIndex === -1 || projectsDB[projectIndex].isDeleted) {
      return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    }

    const project = projectsDB[projectIndex];
    const member = project.members.find((m) => m.username === currentUser.username);
    if (!member || member.role !== 'LEADER') {
      return errorResponse('프로젝트 수정 권한이 없습니다.', 403);
    }

    projectsDB[projectIndex] = {
      ...project,
      projectName: updateRequest.projectName,
      description: updateRequest.description,
      updatedDate: new Date().toISOString(),
    };

    return successResponse(null, 200);
  }),

  // [DELETE] 프로젝트 삭제 (Soft Delete)
  http.delete('*/api/projects/:projectId', ({ params, request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const { projectId } = params;
    const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));

    if (projectIndex === -1 || projectsDB[projectIndex].isDeleted) {
      return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    }

    const project = projectsDB[projectIndex];
    const member = project.members.find((m) => m.username === currentUser.username);
    if (!member || member.role !== 'LEADER') {
      return errorResponse('프로젝트 삭제 권한이 없습니다.', 403);
    }

    projectsDB[projectIndex].isDeleted = true;
    projectsDB[projectIndex].deleteUsername = currentUser.username;
    projectsDB[projectIndex].updatedDate = new Date().toISOString();

    return successResponse(null, 200);
  }),

  // [POST] 프로젝트 복구
  http.post('*/api/project/restore/:projectId', ({ params, request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const { projectId } = params;
    const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));

    if (projectIndex === -1) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);

    projectsDB[projectIndex].isDeleted = false;
    projectsDB[projectIndex].deleteUsername = null;
    projectsDB[projectIndex].updatedDate = new Date().toISOString();

    // 복구 시 본인을 리더로 다시 추가 (비즈니스 로직에 따름)
    if (!projectsDB[projectIndex].members.some((m) => m.username === currentUser.username)) {
      projectsDB[projectIndex].members.push({
        username: currentUser.username,
        nickname: currentUser.nickname,
        role: 'LEADER',
      });
      projectsDB[projectIndex].memberCount = projectsDB[projectIndex].members.length;
    }

    return successResponse(null, 200);
  }),

  // [DELETE] 프로젝트 영구 삭제
  http.delete('*/api/project/:projectId/permanent', ({ params, request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const { projectId } = params;
    const projectIndex = projectsDB.findIndex((p) => p.projectId === Number(projectId));

    if (projectIndex === -1) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);

    // 삭제 권한 확인 (본인이 삭제한 프로젝트만 영구 삭제 가능하도록 가정)
    if (projectsDB[projectIndex].deleteUsername !== currentUser.username) {
      return errorResponse('영구 삭제 권한이 없습니다.', 403);
    }

    projectsDB.splice(projectIndex, 1);

    return successResponse(null, 200);
  }),
];
