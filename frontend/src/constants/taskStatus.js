// 태스크 상태 Enum 상수 정의 (백엔드 ENUM 및 더미 데이터와 대소문자 일치)
// 사용 예시:
//   import { TASK_STATUS } from '@/constants/taskStatus.js';
//   if (task.status === TASK_STATUS.DELETED) { ... }
//   useGetTasksByStatus({ projectId, status: TASK_STATUS.DELETED });

export const TASK_STATUS = Object.freeze({
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  DELETED: 'DELETED',
});

// 상태 배열이 필요할 때를 위한 유틸 상수 예시
export const TASK_STATUS_LIST = Object.freeze([
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.DONE,
  TASK_STATUS.DELETED,
]);
