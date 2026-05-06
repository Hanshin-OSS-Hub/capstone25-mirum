import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 태스크 목록 조회 API
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {{ projectId: number }} RequestGetTaskSummary
 * @param {RequestGetTaskSummary} params
 * @see TaskSummaryDTO
 * @see ../../../../../backend/src/main/java/backend/dto/Tasks/TaskSummaryDTO.java
 * @typedef {Pick<TaskData, 'projectId' | 'taskId' | 'title' | 'status' | 'createdDate' | 'updatedDate'>} ResponseTaskGetSummaryDTO
 * @returns {import('@tanstack/react-query').UseQueryResult<ResponseTaskGetSummaryDTO[], unknown>}
 */

export const useGetTaskList = ({ projectId }) => {
  // Auth 토큰이 준비되기 전에 쿼리부터 실행되면 401/403으로 실패하고,
  // 전역 staleTime(5분) 때문에 이후에도 재시도가 막혀 tasks가 계속 []로 보일 수 있습니다.
  const isTokenAvailable =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: ['tasks', Number(projectId)],
    queryFn: async () => {
      /** @type {ResponseTaskGetSummaryDTO[]} */
      return await api.get(`/project/${projectId}/task`);
    },
    enabled: !!projectId && isTokenAvailable,
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
