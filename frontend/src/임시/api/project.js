import { http } from 'msw';
import { database } from '../../mocks/database.js';
import { errorResponse, successResponse } from './common.js';
import { parseUsername } from './common.js';

/**
 * @typedef {import('@/features/projects/api/useCreateProject.js').CreateProjectRequestDTO} CreateProjectRequestDTO
 * @typedef {import('@/features/projects/api/useUpdateProject.js').UpdateProjectRequestDTO} UpdateProjectRequestDTO
 */

export const projectHandlers = [
  /** {@link useGetProjectList} */
  /** {@link useGetDeletedProject} */
  // [GET] 프로젝트 목록 조회 (삭제된 프로젝트 포함)
  http.get('*/api/projects', ({ request }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('authorization');

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

    // 쿼리 파라미터 확인
    const url = new URL(request.url);
    const isDeleted = url.searchParams.get('deleted') === 'true';

    if (isDeleted) {
      // 내(로그인 사용자)가 삭제한 프로젝트 목록 조회
      const myDeletedProjects = database.deleted_projects.filter(
        (p) => p.deleteUsername === username,
      );
      console.log('MSW: 삭제된 프로젝트 목록 조회');
      return successResponse(myDeletedProjects, 200);
    }
    // 내(로그인 사용자)가 멤버로 속한 프로젝트만 조회
    const myProjects = database.projects.filter((p) =>
      p.members.some((m) => m.username === username),
    );
    // 목록 조회 시에는 상세 정보를 제외하고 ProjectsDTO 형태로 가공
    const projectList = myProjects.map((p) => ({
      projectId: p.projectId,
      projectName: p.projectName,
      description: p.description,
      memberCount: p.members.length,
      taskProgress: p.taskProgress,
      creationDate: p.creationDate,
    }));
    return successResponse(projectList, 200);
  }),

  /** {@link useGetProjectDetails} */
  // [GET] 프로젝트 상세 조회
  http.get('*/api/project/:id', ({ request, params }) => {
    // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
    const authHeader = request.headers.get('authorization');

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

    const { id } = params;
    const target = database.projects.find((p) => p.projectId === Number(id));

    if (target) {
      // 상세 조회 시에는 ProjectResponseDTO 형태로 가공
      const projectDetails = {
        projectId: target.projectId,
        projectName: target.projectName,
        description: target.description,
        creationDate: target.creationDate,
        members: target.members,
      };
      return successResponse(projectDetails, 200);
    } else {
      return errorResponse('해당 프로젝트를 찾을 수 없습니다.', 404);
    }
  }),

  /** {@link useCreateProject} */
  // [POST] 새 프로젝트 생성
  http.post('*/api/project', async ({ request }) => {
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
    /** @type {any} */
    const newProjectData = await request.json();

    // ID 생성 전략 개선: Max ID + 1
    const allProjectIds = [...database.projects, ...database.deleted_projects].map(
      (p) => p.projectId,
    );
    const maxId = allProjectIds.length > 0 ? Math.max(...allProjectIds) : 0;

    const newProject = {
      projectId: maxId + 1,
      projectName: newProjectData.projectName,
      description: newProjectData.description,
      taskProgress: 0,
      memberCount: 1,
      creationDate: new Date().toISOString(),
      isDeleted: false,
      deleteUsername: null,
      members: [
        {
          username: userData.username,
          nickname: userData.nickname,
          role: 'LEADER',
        },
      ],
    };
    database.projects.push(newProject);

    // --- [자동 생성 로직] 기본 보드 3개 생성 ---
    const boardTypes = [
      { name: '메인 보드', type: 'KANBAN' },
      { name: '일정', type: 'CALENDAR' },
      { name: '파일함', type: 'FILE_LIBRARY' },
    ];

    boardTypes.forEach((boardInfo, index) => {
      // 보드 ID 생성 (기존 보드 ID 최댓값 + 1 + index)
      const allBoardIds = database.boards.map((b) => b.boardId);
      const maxBoardId = allBoardIds.length > 0 ? Math.max(...allBoardIds) : 0;

      database.boards.push({
        boardId: maxBoardId + 1 + index, // 고유 ID 보장
        projectId: newProject.projectId,
        name: boardInfo.name,
        type: boardInfo.type,
        config: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
    // ----------------------------------------

    return successResponse({ projectId: newProject.projectId }, 201);
  }),

  /** {@link useUpdateProject} */
  // [PUT] 프로젝트 정보 수정
  http.put('*/api/project', async ({ request }) => {
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

    /** @type {any} */
    const updatedData = await request.json();
    const index = database.projects.findIndex((p) => p.projectId === Number(updatedData.projectId));

    if (index !== -1) {
      database.projects[index] = { ...database.projects[index], ...updatedData };
      return successResponse(
        // projects[index],
        null, // 명세서에 따라 null 반환
        200,
      );
    } else {
      return errorResponse('해당 프로젝트를 찾을 수 없습니다.', 404);
    }
  }),

  /** {@link useDeleteProject} */
  // [DELETE] 프로젝트 삭제 (Soft Delete)
  http.delete('*/api/project/:id', ({ params, request }) => {
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

    const { id } = params;
    const index = database.projects.findIndex((p) => p.projectId === Number(id));

    if (index !== -1) {
      // 삭제 요청된 프로젝트 객체 상태 수정
      const deletedProject = database.projects.splice(index, 1)[0];
      deletedProject.isDeleted = true;
      deletedProject.deleteUsername = username;
      // 삭제 시 updateDate 갱신 (선택 사항)
      deletedProject.updateDate = new Date().toISOString();

      database.deleted_projects.push(deletedProject);

      // --- [Cascade Soft Delete] 태스크 상태 'ARCHIVED'로 변경 ---
      database.tasks.forEach((task) => {
        if (task.projectId === Number(id)) {
          task.status = 'ARCHIVED';
          task.updateDate = new Date().toISOString();
        }
      });
      // --------------------------------------------------------

      return successResponse(
        null, // 명세서에 따라 null 반환
        200,
      );
    } else {
      return errorResponse('해당 프로젝트를 찾을 수 없습니다.', 404);
    }
  }),

  /** {@link useRestoreProject} */
  // [POST] 프로젝트 복구
  http.post('*/api/project/restore/:id', async ({ params, request }) => {
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

    const { id } = params;
    const deletedIndex = database.deleted_projects.findIndex((p) => p.projectId === Number(id));

    if (deletedIndex === -1) {
      return errorResponse('해당 삭제된 프로젝트를 찾을 수 없습니다.', 404);
    }

    const deletedProject = database.deleted_projects[deletedIndex];

    // 권한 체크 (삭제한 사람만 복구 가능)
    if (deletedProject.deleteUsername !== username) {
      return errorResponse('복구 권한이 없습니다.', 403);
    }

    // 데이터 무결성: 기존 projects에 동일 projectId가 없어야 함
    if (database.projects.some((p) => p.projectId === deletedProject.projectId)) {
      return errorResponse('이미 복구된 프로젝트입니다.', 409);
    }

    // 복구: isDeleted, deleteUsername 초기화
    const restoredProject = database.deleted_projects.splice(deletedIndex, 1)[0];
    restoredProject.isDeleted = false;
    restoredProject.deleteUsername = null;
    restoredProject.memberCount = 1;
    restoredProject.members = [
      {
        username: userData.username,
        nickname: userData.nickname,
        role: 'LEADER',
      },
    ];
    // 복구 시 updateDate 갱신 (선택 사항)
    restoredProject.updateDate = new Date().toISOString();

    database.projects.push(restoredProject);

    // --- [Cascade Restore] 태스크 상태 복구 ('ARCHIVED' -> 'TODO') ---
    database.tasks.forEach((task) => {
      if (task.projectId === Number(id) && task.status === 'ARCHIVED') {
        task.status = 'TODO'; // 이전 상태를 모르므로 TODO로 초기화
        task.updateDate = new Date().toISOString();
      }
    });
    // -----------------------------------------------------------

    return successResponse({ projectId: restoredProject.projectId }, 200);
  }),
];
