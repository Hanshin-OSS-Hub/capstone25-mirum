import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 태스크 목록 조회 API
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {{ projectId: number }} RequestGetTaskSummary
 * @param {RequestGetTaskSummary} params
 *
 * @see TaskSummaryDTO
 * @see ../../../../../backend/src/main/java/backend/dto/Tasks/TaskSummaryDTO.java
 * @typedef {Pick<TaskData, 'projectId' | 'taskId' | 'title' | 'status' | 'createdDate' | 'updatedDate'>} ResponseTaskGetSummaryDTO
 * @returns {import('@tanstack/react-query').UseQueryResult<ResponseTaskGetSummaryDTO[], unknown>}
 */

export const useGetTaskList = ({ projectId }) => {
  return useQuery({
    queryKey: ['tasks', Number(projectId)],
    queryFn: async () => {
      /** @type {ResponseTaskGetSummaryDTO[]} */
      return await api.get(`/project/${projectId}/task`);
    },
    initialData: [],
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      return [...data].sort((a, b) => {
        const dateA = new Date(a.updatedDate);
        const dateB = new Date(b.updatedDate);
        return dateB - dateA;
      });
    },
  });
};
