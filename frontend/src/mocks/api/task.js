import { errorResponse, parseUsername, successResponse } from '@/mocks/api/common.js';
import { database } from '@/mocks/database.js';
import { http } from 'msw';

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
    const userData = database.users.find((u) => u.username === username);
    if (!userData) return errorResponse('유효하지 않은 사용자입니다.', 401);

    // 3. 파라미터 파싱
    const url = new URL(request.url);
    const boardId = url.searchParams.get('boardId');
    // 페이징 파라미터 (일단은 전체 반환으로 구현, 추후 slice 적용 가능)
    // const page = url.searchParams.get('page') || 0;
    // const size = url.searchParams.get('size') || 20;

    if (!boardId) return errorResponse('boardId is required', 400);

    // 4. 태스크 목록 조회 및 필터링
    // status가 DELETED나 ARCHIVED인 것은 제외 (활성 태스크만)
    const tasks = database.tasks.filter(
      (t) => t.boardId === Number(boardId) && t.status !== 'DELETED' && t.status !== 'ARCHIVED',
    );

    console.log(`MSW: 태스크 목록 조회 (Board: ${boardId}, Count: ${tasks.length})`);
    return successResponse(
      {
        content: tasks, // 페이징 구조 흉내 (content 배열)
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
    const allIds = database.tasks.map((t) => t.taskId);
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
      assigneeId: newTaskRequest.assigneeId, // ID로 저장
      assigneeName: null, // 추후 채움
      assignee: newTaskRequest.assignee, // 프론트 분류용 (중요!)
      creationDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      dueDate: newTaskRequest.dueDate,
    };

    database.tasks.push(newTask);
    console.log('MSW: 새 태스크 생성', newTask);

    // 수정됨: taskId만 반환하지 않고, 생성된 태스크 객체 전체를 반환하여
    // 프론트엔드에서 data.boardId 등에 일관성 있게 접근할 수 있도록 함.
    return successResponse(newTask, 201);
  }),

  /** {@link useUpdateTask} */
  // [PATCH] 태스크 수정
  http.patch('*/api/tasks', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const updatedTaskRequest = await request.json();
    const { taskId } = updatedTaskRequest;

    const taskIndex = database.tasks.findIndex((t) => t.taskId === Number(taskId));
    if (taskIndex === -1) return errorResponse('Task not found', 404);

    const task = database.tasks[taskIndex];

    const updatedTask = {
      ...task,
      ...updatedTaskRequest,
      updateDate: new Date().toISOString(),
    };
    database.tasks[taskIndex] = updatedTask;
    console.log('MSW: 태스크 수정', updatedTask);
    return successResponse(null, 204); // 204 No Content
  }),

  /** {@link useDeleteTask} */
  // [DELETE] 태스크 삭제 (Soft Delete -> DELETED)
  http.delete('*/api/tasks/:taskId', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return errorResponse('로그인이 필요합니다.', 401);

    const { taskId } = params;
    const task = database.tasks.find((t) => t.taskId === Number(taskId));

    if (!task) return errorResponse('Task not found', 404);

    // 상태 변경 (Soft Delete)
    task.status = 'DELETED';
    task.updateDate = new Date().toISOString();

    console.log(`MSW: 태스크 삭제(DELETED) 완료 (ID: ${taskId})`);
    return successResponse(null, 204); // 204 No Content
  }),
];
