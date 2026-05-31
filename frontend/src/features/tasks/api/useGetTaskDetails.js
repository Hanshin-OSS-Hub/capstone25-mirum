import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [READ] 작업 카드 상세정보 조회 API
 * @typedef {import('@/types/task.js').TaskData} TaskData
 * @typedef {{ projectId: number, taskId: number }} RequestGetTaskDetailsDTO
 * @param {RequestGetTaskDetailsDTO} params
 * @see TaskDetailDTO
 * @see ../../../../../backend/src/main/java/backend/dto/Tasks/TaskDetailDTO.java
 * @returns {import('@tanstack/react-query').UseQueryResult<TaskData, unknown>}
 */

export const useGetTaskDetails = ({ projectId, taskId }) => {
  const normalizedProjectId = Number(projectId);
  const normalizedTaskId = Number(taskId);

  return useQuery({
    queryKey: ['task', normalizedProjectId, normalizedTaskId],
    /** @type {TaskData} */
    queryFn: async () => {
      return await api.get(`/api/project/${normalizedProjectId}/task/${normalizedTaskId}`);
    },
    staleTime: 0, // 항상 상한 데이터로 간주
    gcTime: 0,    // 캐시 보관 안함 (즉시 요청 강제)
    enabled: !!normalizedProjectId && !!normalizedTaskId,
  });
};
