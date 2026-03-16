import { errorResponse, parseUsername, successResponse } from '@/mocks/api/common.js';
import { database } from '@/mocks/database.js';
import { http } from 'msw';

export const boardHandlers = [
  /** {@link useGetBoards} */
  // [GET] 프로젝트의 보드 목록 조회
  http.get('*/api/projects/:projectId/boards', ({ params, request }) => {
    // 1. 인증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    // 2. 권한 확인 (프로젝트 멤버인지)
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);
    const { projectId } = params;

    // 3. 프로젝트 조회 및 삭제 여부 확인
    const project = database.projects.find((p) => p.projectId === Number(projectId));

    // 활성 프로젝트가 아니면 404 반환
    if (!project || project.isDeleted) {
      return errorResponse('Project not found', 404);
    }

    // 4. 권한 확인 (프로젝트 멤버인지)
    if (!project.members.some((m) => m.username === username)) {
      return errorResponse('접근 권한이 없습니다.', 403);
    }

    // 5. 보드 목록 조회
    const boards = database.boards.filter((b) => b.projectId === Number(projectId));

    return successResponse(boards, 200);
  }),

  // [POST /api/boards] 핸들러 제거
  // 이유: Board CRUD 정책에 따라, 보드는 프로젝트 생성 시 자동으로만 생성되며
  // 사용자가 직접 생성하는 API는 제공하지 않음.
];
