import { http } from 'msw';
import { errorResponse, parseUsername, successResponse } from '../common.js';
import { usersDB } from '../users/model.js';
import { tasksDB } from './model.js';

export const taskHandlers = [
  /** {@link useGetTaskList} */
  // [GET] 보드의 태스크 목록 조회
  http.get('*/api/tasks', ({ request }) => {
    // 1. 인증
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const token = authHeader.split(' ')[1];
    const username = parseUsername(token);

    // 2. 권한 확인 (프로젝트 멤버인지)
    const userData = usersDB.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    // 3. 파라미터 파싱
    const url = new URL(request.url);
    const boardId = url.searchParams.get('boardId');

    if (!boardId) return errorResponse('boardId is required', 400);

    // 4. 태스크 목록 조회 및 필터링
    const tasks = tasksDB.filter(
      (t) => t.boardId === Number(boardId) && t.status !== 'DELETED' && t.status !== 'ARCHIVED',
    );

    console.log(`MSW: 태스크 목록 조회 (Board: ${boardId}, Count: ${tasks.length})`);
    return successResponse(
      {
        content: tasks,
        totalPages: 1,
        totalElements: tasks.length,
        last: true,
        number: 0,
      },
      200,
    );
  }),

  /** {@link useCreateTask} */
  // [POST] 새 태스크 생성
  http.post('*/api/tasks', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const newTaskRequest = await request.json();

    // ID 생성
    const allIds = tasksDB.map((t) => t.taskId);
    const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;

    const newTask = {
      taskId: maxId + 1,
      projectId: newTaskRequest.projectId,
      boardId: newTaskRequest.boardId,
      title: newTaskRequest.title,
      description: newTaskRequest.description,
      status: newTaskRequest.status || 'TODO',
      tags: newTaskRequest.tags || [],
      notes: newTaskRequest.notes || '',
      assigneeId: newTaskRequest.assigneeId,
      assigneeName: null,
      assignee: newTaskRequest.assignee,
      creationDate: new Date().toISOString(), // DB 저장 시 문자열로 직렬화
      updateDate: new Date().toISOString(),
      dueDate: newTaskRequest.dueDate,
    };

    // 실제 앱에서는 Date 객체로 관리해야 하므로 파싱
    tasksDB.push({
      ...newTask,
      createdDate: new Date(newTask.creationDate),
      updatedDate: new Date(newTask.updateDate),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
    });
    console.log('MSW: 새 태스크 생성', newTask);

    return successResponse(newTask, 201);
  }),

  /** {@link useUpdateTask} */
  // [PATCH] 태스크 수정
  http.patch('*/api/tasks', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const updatedTaskRequest = await request.json();
    const { taskId } = updatedTaskRequest;

    const taskIndex = tasksDB.findIndex((t) => t.taskId === Number(taskId));
    if (taskIndex === -1) return errorResponse('Task not found', 404);

    const task = tasksDB[taskIndex];

    const updatedTask = {
      ...task,
      ...updatedTaskRequest,
      updatedDate: new Date(), // Date 객체 유지
    };
    tasksDB[taskIndex] = updatedTask;
    console.log('MSW: 태스크 수정', updatedTask);
    return successResponse(null, 204);
  }),

  /** {@link useDeleteTask} */
  // [DELETE] 태스크 삭제 (Soft Delete -> DELETED)
  http.delete('*/api/tasks/:taskId', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const { taskId } = params;
    const task = tasksDB.find((t) => t.taskId === Number(taskId));

    if (!task) return errorResponse('Task not found', 404);

    task.status = 'DELETED';
    task.updatedDate = new Date();

    console.log(`MSW: 태스크 삭제(DELETED) 완료 (ID: ${taskId})`);
    return successResponse(null, 204);
  }),
];
