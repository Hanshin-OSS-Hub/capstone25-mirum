import rawTasksData from './data.json';
import rawDeletedTasksData from './data_deleted.json';

/**
 * @typedef {import('@/features/tasks/types/task.js').TaskData} TaskData
 */

/**
 * tasks.json 데이터를 앱에서 사용할 수 있는 TaskData[] 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 * @type {TaskData[]}
 */
export const tasksDB = rawTasksData.map((task) => ({
  taskId: task.taskId,
  projectId: task.projectId,
  title: task.title,
  description: task.description,
  status: /** @type {TaskData['status']} */ (task.status),
  tags: task.tags,
  notes: task.notes,
  assigneeId: task.assigneeId,
  assigneeName: task.assigneeName,
  assigneeProfileImage: task.assigneeProfileImage,
  startDate: task.startDate ? new Date(task.startDate) : null,
  dueDate: task.dueDate ? new Date(task.dueDate) : null,
  createdDate: new Date(task.createdDate),
  updatedDate: new Date(task.updatedDate),
}));

export const deletedTasksDB = rawDeletedTasksData.map((task) => ({
  ...task,
  deletedDate: new Date(task.deletedDate),
}));
