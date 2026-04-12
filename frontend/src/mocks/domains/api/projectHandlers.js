import { processToken } from '@/mocks/domains/api/tokenHandlers.js';
import { http } from 'msw';
import { errorResponse, successResponse } from '../common.js';
import { projectsDB } from '../model/projectDataModel.js';

export const projectHandlers = [
  // [GET] 참여 중인 프로젝트 목록 조회
  http.get('*/api/projects', ({ request }) => {
    const currentUser = processToken(request);
    if (currentUser instanceof Response) return currentUser;

    const myProjects = projectsDB.filter(
      (project) =>
        !project.isDeleted &&
        project.members.some((member) => member.username === currentUser.username),
    );
    console.log('MSW: 참여 중인 프로젝트 목록 조회 (myProjects)', myProjects);

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

    console.log(`MSW: 프로젝트 상세 조회 (projectId: ${projectId})`, project);
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
      creationDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
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
    console.log('MSW: 새 프로젝트 생성', newProject);

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
      updateDate: new Date().toISOString(),
    };

    console.log(`MSW: 프로젝트 수정 (projectId: ${projectId})`, projectsDB[projectIndex]);
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

    console.log(`MSW: 프로젝트 삭제 처리 (projectId: ${projectId})`);
    return successResponse(null, 200);
  }),
];
