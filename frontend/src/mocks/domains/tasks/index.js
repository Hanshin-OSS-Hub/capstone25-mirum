import { projectsDB } from '@/mocks/domains/projects/model.js';
import { deletedTasksDB, tasksDB } from '@/mocks/domains/tasks/model.js';
import { usersDB } from '@/mocks/domains/users/model.js';
import { http } from 'msw';
import { errorResponse, parseUsername, successResponse } from '../common.js';

export const taskHandlers = [
  /** {@link useGetTaskList} */
  // [GET] 프로젝트의 태스크 목록 조회
  http.get('*/api/project/:projectId/task', ({ request, params }) => {
    // 1. 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);
    // (야매) 토큰 처리 - username 조회 과정 생략
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 2. 유저 정보 검증
    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    // 3. 프로젝트 정보 검증
    const { projectId } = params;
    // projectId가 null(undefined)인 경우
    if (!projectId) return errorResponse('유효하지 않은 요청입니다.', 400);
    const projectData = projectsDB.find((p) => p.projectId === Number(projectId));
    // 프로젝트 정보가 DB에 존재하지 않는 경우
    if (!projectData) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    // 프로젝트 멤버인지 확인
    const isMember = projectData.members.some((m) => m.username === userData.username);
    if (!isMember) return errorResponse('프로젝트 멤버가 아닙니다.', 403);

    // 4. 태스크 목록 조회 및 필터링
    const tasks = tasksDB.filter(
      (t) => t.projectId === Number(projectId) && t.status !== 'DELETED',
    );

    console.log(`MSW: 태스크 목록 조회 (Project ID: ${projectId}, Count: ${tasks.length})`);
    return successResponse(tasks, 200);
  }),

  /** {@link useCreateTask} */
  // [POST] 새 태스크 생성
  http.post('*/api/project/:projectId/task', async ({ request }) => {
    // 1. 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);
    // 2. 요청 body 파싱
    /** @type {import('@/features/tasks/types/task.js').TaskRequestDTO} */
    let newTaskRequest;
    // 🌟 Body 파싱 안전하게 처리
    try {
      newTaskRequest = await request.json();
    } catch (error) {
      return errorResponse('요청 Body가 비어있거나 잘못된 JSON 형식입니다.', 400);
    }

    // 필수값 검증
    if (!newTaskRequest?.title) {
      return errorResponse('title은 필수 항목입니다.', 400);
    }

    // 3. 새 작업 카드(Task) 생성
    const allIds = tasksDB.map((t) => t.taskId);
    const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;

    const newTask = {
      taskId: maxId + 1,
      projectId: newTaskRequest.projectId,
      // boardId: newTaskRequest.boardId,
      title: newTaskRequest.title,
      description: newTaskRequest.description,
      status: newTaskRequest.status || 'TODO',
      tags: newTaskRequest.tags || [],
      notes: newTaskRequest.notes || '',
      assigneeId: newTaskRequest.assigneeId,
      assigneeName: null,
      assignee: newTaskRequest.assignee,
      createdDate: new Date().toISOString(), // DB 저장 시 문자열로 직렬화
      updatedDate: new Date().toISOString(),
      dueDate: newTaskRequest.dueDate,
    };

    // 실제 앱에서는 Date 객체로 관리해야 하므로 파싱
    tasksDB.push({
      ...newTask,
      createdDate: new Date(newTask.createdDate),
      updatedDate: new Date(newTask.updatedDate),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
    });
    console.log('MSW: 새 태스크 생성', newTask);

    return successResponse(newTask, 201);
  }),

  /** {@link useUpdateTask} */
  // [PATCH] 태스크 수정
  http.patch('*/api/project/:projectId/task/:taskId', async ({ request }) => {
    // 1. 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);
    // 2. 요청 body 파싱
    /** @type {import('@/features/tasks/types/task.js').TaskRequestDTO} */
    const updatedTaskRequest = await request.json();
    const { taskId } = updatedTaskRequest;

    const taskIndex = tasksDB.findIndex((t) => t.taskId === Number(taskId));
    if (taskIndex === -1) return errorResponse('작업 카드를 찾을 수 없습니다.', 404);

    const task = tasksDB[taskIndex];

    const updatedTask = {
      ...task,
      ...updatedTaskRequest,
      updatedDate: new Date(), // Date 객체 유지
    };
    tasksDB[taskIndex] = updatedTask;
    console.log('MSW: 태스크 수정', updatedTask);
    return successResponse(updatedTask, 200);
  }),

  /** {@link useDeleteTask} */
  // [DELETE] 태스크 삭제 (Soft Delete -> DELETED)
  http.delete('*/api/project/:projectId/task/:taskId', ({ params, request }) => {
    // 1. 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const { taskId } = params;
    const task = tasksDB.find((t) => t.taskId === Number(taskId));

    if (!task) return errorResponse('작업 카드를 찾을 수 없습니다.', 404);

    task.status = 'DELETED';
    task.updatedDate = new Date();

    console.log(`MSW: 태스크 삭제(DELETED) 완료 (ID: ${taskId})`);
    return successResponse(null, 204);
  }),

  /** {@link useRestoreTask} */
  // [PATCH] 태스크 복구 (DELETED -> TODO)
  http.patch('*/api/project/:projectId/task/:taskId/restore', ({ params, request }) => {
    // 1. 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const { taskId } = params;
    const task = tasksDB.find((t) => t.taskId === Number(taskId));

    if (!task) return errorResponse('작업 카드를 찾을 수 없습니다.', 404);
    if (task.status !== 'DELETED') {
      return errorResponse('복구할 수 없는 상태입니다.', 400);
    }
    task.status = 'TODO';
    task.updatedDate = new Date();

    console.log(`MSW: 태스크 복구 완료 (ID: ${taskId})`);
    return successResponse(null, 204);
  }),

  /** {@link useGetTasksByStatus} */
  // [GET] 상태별 태스크 목록 조회 (현재는 삭제된 태스크 목록 조회용)
  http.get('*/api/project/:projectId/task/status?status=:status', ({ request, params }) => {
    // 1. 토큰 검증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);
    // (야매) 토큰 처리 - username 조회 과정 생략
    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 2. 유저 정보 검증
    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    // 3. 프로젝트 정보 검증
    const { projectId } = params;
    // projectId가 null(undefined)인 경우
    if (!projectId) return errorResponse('유효하지 않은 요청입니다.', 400);
    const projectData = projectsDB.find((p) => p.projectId === Number(projectId));
    // 프로젝트 정보가 DB에 존재하지 않는 경우
    if (!projectData) return errorResponse('프로젝트를 찾을 수 없습니다.', 404);
    // 프로젝트 멤버인지 확인
    const isMember = projectData.members.some((m) => m.username === userData.username);
    if (!isMember) return errorResponse('프로젝트 멤버가 아닙니다.', 403);

    // 4. 삭제된 태스크 목록 조회
    const deletedTasks = deletedTasksDB.filter((t) => {
      return t.projectId === Number(projectId) && t.status === 'DELETED';
    });
    console.log(
      `MSW: 삭제된 태스크 목록 조회 (Project ID: ${projectId}, Count: ${deletedTasks.length})`,
    );
    return successResponse(deletedTasks, 200);
  }),
];
