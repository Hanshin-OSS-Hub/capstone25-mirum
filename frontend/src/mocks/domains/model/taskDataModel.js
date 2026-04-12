import rawDeletedTasksData from '../../../../../global/data/dummyDeletedTasks.json';
import rawTasksData from '../../../../../global/data/dummyTasks.json';

/**
 * @typedef {import('@/types/task.js').TaskData} TaskData
 */

/**
 * tasks.json 데이터를 앱에서 사용할 수 있는 TaskData[] 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 * @type {TaskData[]}
 */

export const tasksDB = rawTasksData.map((task) => ({
  // 참조 데이터
  projectId: task.projectId,
  // 기본 데이터
  taskId: task.taskId,
  title: task.title,
  description: task.description,
  status: /** @type {TaskData['status']} */ (task.status),
  // 태그 데이터
  tags: task.tags,
  // 기타 데이터
  notes: task.notes,
  // 담당자 데이터
  assigneeId: task.assigneeId,
  assigneeName: task.assigneeName,
  assigneeProfileImage: task.assigneeProfileImage,
  // 날짜 데이터
  startDate: task.startDate ? new Date(task.startDate) : null,
  dueDate: task.dueDate ? new Date(task.dueDate) : null,
  createdDate: new Date(task.createdDate),
  updatedDate: new Date(task.updatedDate),
  deletedDate: null,
}));

export const deletedTasksDB = rawDeletedTasksData.map((task) => ({
  // 참조 데이터
  projectId: task.projectId,
  // 기본 데이터
  taskId: task.taskId,
  title: task.title,
  description: task.description,
  status: /** @type {TaskData['status']} */ ('DELETED'),
  // 태그 데이터
  tags: task.tags,
  // 기타 데이터
  notes: task.notes,
  // 담당자 데이터
  assigneeId: task.assigneeId,
  assigneeName: task.assigneeName,
  assigneeProfileImage: task.assigneeProfileImage,
  // 날짜 데이터
  startDate: task.startDate ? new Date(task.startDate) : null,
  dueDate: task.dueDate ? new Date(task.dueDate) : null,
  createdDate: new Date(task.createdDate),
  updatedDate: new Date(task.updatedDate),
  deletedDate: new Date(task.deletedDate),
}));
